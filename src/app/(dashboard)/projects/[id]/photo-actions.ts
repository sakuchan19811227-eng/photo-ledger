"use server";

/**
 * 写真アップロードのサーバー処理。
 * 流れ: 本人確認 → 現場の所有確認 → 各ファイルを検証 → EXIF読取 →
 *       ストレージ保存 → DB登録。1枚ずつ結果を返す。
 */
import { revalidatePath } from "next/cache";
import { getServerAuthService } from "@/lib/auth";
import { getPhotoRepository, getProjectRepository } from "@/lib/repositories";
import { getServerStorage } from "@/lib/storage";
import { extractTakenAt } from "@/lib/utils/exif";

/** 受け付ける画像形式と上限サイズ */
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
};
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export type UploadReport = {
  ok: boolean;
  message: string;
  /** ファイルごとの結果（画面に表示する） */
  results: Array<{ fileName: string; ok: boolean; detail: string }>;
};

export async function uploadPhotosAction(
  projectId: string,
  formData: FormData
): Promise<UploadReport> {
  const auth = await getServerAuthService();
  const user = await auth.getCurrentUser();
  if (!user) {
    return { ok: false, message: "ログインしてください", results: [] };
  }

  // 自分の現場かどうか確認（他人の現場へのアップロードを拒否）
  const project = await getProjectRepository().findById(projectId, user.id);
  if (!project || project.isDeleted) {
    return { ok: false, message: "対象の現場が見つかりません", results: [] };
  }

  const files = formData
    .getAll("photos")
    .filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) {
    return { ok: false, message: "ファイルが選択されていません", results: [] };
  }

  const storage = await getServerStorage();
  const photoRepo = getPhotoRepository();
  let sortOrder = await photoRepo.nextSortOrder(projectId);

  const results: UploadReport["results"] = [];

  for (const file of files) {
    const ext = ALLOWED_TYPES[file.type];
    if (!ext) {
      results.push({
        fileName: file.name,
        ok: false,
        detail: "対応していない形式です（JPEG/PNG/WebP/HEICのみ）",
      });
      continue;
    }
    if (file.size > MAX_FILE_SIZE) {
      results.push({
        fileName: file.name,
        ok: false,
        detail: "サイズが大きすぎます（20MBまで）",
      });
      continue;
    }

    const data = await file.arrayBuffer();
    const takenAt = await extractTakenAt(data);

    const path = `${projectId}/${crypto.randomUUID()}.${ext}`;
    const uploaded = await storage.upload(path, data, file.type);
    if (!uploaded.ok) {
      results.push({
        fileName: file.name,
        ok: false,
        detail: `保存に失敗しました: ${uploaded.message}`,
      });
      continue;
    }

    await photoRepo.create({
      projectId,
      fileName: file.name,
      storagePath: path,
      takenAt,
      sortOrder: sortOrder++,
      createdBy: user.id,
    });

    results.push({
      fileName: file.name,
      ok: true,
      detail: takenAt
        ? `撮影日時 ${takenAt.toLocaleString("ja-JP")} を読み取りました`
        : "アップロード完了（撮影日時なし）",
    });
  }

  revalidatePath(`/projects/${projectId}`);

  const okCount = results.filter((r) => r.ok).length;
  return {
    ok: okCount > 0,
    message: `${okCount} / ${files.length} 枚をアップロードしました`,
    results,
  };
}

/** 本人確認＋現場の所有確認。OKならユーザーIDを返す */
async function requireProjectOwner(projectId: string): Promise<string | null> {
  const auth = await getServerAuthService();
  const user = await auth.getCurrentUser();
  if (!user) return null;
  const project = await getProjectRepository().findById(projectId, user.id);
  if (!project || project.isDeleted) return null;
  return user.id;
}

export type SimpleResult = { ok: boolean; message: string };

/** 写真コメントの保存 */
export async function updatePhotoCommentAction(
  projectId: string,
  photoId: string,
  comment: string
): Promise<SimpleResult> {
  const userId = await requireProjectOwner(projectId);
  if (!userId) return { ok: false, message: "権限がありません" };

  const saved = await getPhotoRepository().updateComment(
    photoId,
    projectId,
    comment.trim()
  );
  if (!saved) return { ok: false, message: "対象の写真が見つかりません" };

  revalidatePath(`/projects/${projectId}`);
  return { ok: true, message: "コメントを保存しました" };
}

/** 写真の並び替え（1つ上へ / 1つ下へ） */
export async function movePhotoAction(
  projectId: string,
  photoId: string,
  direction: "up" | "down"
): Promise<SimpleResult> {
  const userId = await requireProjectOwner(projectId);
  if (!userId) return { ok: false, message: "権限がありません" };

  const repo = getPhotoRepository();
  const list = await repo.listByProject(projectId);
  const index = list.findIndex((p) => p.id === photoId);
  if (index === -1) return { ok: false, message: "対象の写真が見つかりません" };

  const neighborIndex = direction === "up" ? index - 1 : index + 1;
  if (neighborIndex < 0 || neighborIndex >= list.length) {
    return { ok: true, message: "" }; // 端なので何もしない
  }

  const photo = list[index];
  const neighbor = list[neighborIndex];
  // sort_order を入れ替える（同値の場合に備えて index ベースの値で振り直す）
  const orderA = photo.sortOrder === neighbor.sortOrder ? neighborIndex + 1 : neighbor.sortOrder;
  const orderB = photo.sortOrder === neighbor.sortOrder ? index + 1 : photo.sortOrder;
  await repo.setSortOrder(photo.id, projectId, orderA);
  await repo.setSortOrder(neighbor.id, projectId, orderB);

  revalidatePath(`/projects/${projectId}`);
  return { ok: true, message: "" };
}

/** 選択した写真の一括削除（論理削除・ゴミ箱へ） */
export async function bulkDeletePhotosAction(
  projectId: string,
  photoIds: string[]
): Promise<SimpleResult> {
  const userId = await requireProjectOwner(projectId);
  if (!userId) return { ok: false, message: "権限がありません" };
  if (photoIds.length === 0) {
    return { ok: false, message: "写真が選択されていません" };
  }

  const count = await getPhotoRepository().softDeleteMany(photoIds, projectId);
  revalidatePath(`/projects/${projectId}`);
  return { ok: true, message: `${count}枚をゴミ箱に移動しました` };
}

/** 写真をゴミ箱から復元 */
export async function restorePhotoAction(
  projectId: string,
  photoId: string
): Promise<SimpleResult> {
  const userId = await requireProjectOwner(projectId);
  if (!userId) return { ok: false, message: "権限がありません" };

  const restored = await getPhotoRepository().restore(photoId, projectId);
  if (!restored) return { ok: false, message: "対象の写真が見つかりません" };

  revalidatePath(`/projects/${projectId}`);
  return { ok: true, message: "復元しました" };
}
