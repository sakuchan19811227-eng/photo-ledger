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
