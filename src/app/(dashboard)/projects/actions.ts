"use server";

/**
 * 現場管理のサーバー処理（Server Actions）。
 * 必ずログインユーザーを確認してからリポジトリを呼ぶ。
 */
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getServerAuthService } from "@/lib/auth";
import { getProjectRepository, type ProjectInput } from "@/lib/repositories";

export type FormState = {
  ok: boolean;
  message: string;
};

/** ログインユーザーIDを取得（未ログインなら /login へ） */
async function requireUserId(): Promise<string> {
  const auth = await getServerAuthService();
  const user = await auth.getCurrentUser();
  if (!user) redirect("/login");
  return user.id;
}

/** フォーム入力の取り出しと簡易チェック */
function parseProjectForm(formData: FormData):
  | { ok: true; input: ProjectInput }
  | { ok: false; message: string } {
  const projectName = String(formData.get("projectName") ?? "").trim();
  const constructionName = String(formData.get("constructionName") ?? "").trim();
  const customerName = String(formData.get("customerName") ?? "").trim();
  const startDate = String(formData.get("startDate") ?? "").trim();
  const endDate = String(formData.get("endDate") ?? "").trim();
  const memo = String(formData.get("memo") ?? "").trim();

  if (!projectName) {
    return { ok: false, message: "現場名は必ず入力してください" };
  }
  if (startDate && endDate && startDate > endDate) {
    return { ok: false, message: "工期の終了日は開始日より後にしてください" };
  }

  return {
    ok: true,
    input: {
      projectName,
      constructionName: constructionName || null,
      customerName: customerName || null,
      startDate: startDate || null,
      endDate: endDate || null,
      memo: memo || null,
    },
  };
}

export async function createProjectAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const userId = await requireUserId();

  const parsed = parseProjectForm(formData);
  if (!parsed.ok) return { ok: false, message: parsed.message };

  await getProjectRepository().create(userId, parsed.input);
  revalidatePath("/projects");
  redirect("/projects");
}

export async function updateProjectAction(
  projectId: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const userId = await requireUserId();

  const parsed = parseProjectForm(formData);
  if (!parsed.ok) return { ok: false, message: parsed.message };

  const updated = await getProjectRepository().update(projectId, userId, parsed.input);
  if (!updated) {
    return { ok: false, message: "対象の現場が見つかりませんでした" };
  }
  revalidatePath("/projects");
  redirect("/projects");
}

export async function deleteProjectAction(projectId: string): Promise<void> {
  const userId = await requireUserId();
  await getProjectRepository().softDelete(projectId, userId);
  revalidatePath("/projects");
}

export async function restoreProjectAction(projectId: string): Promise<void> {
  const userId = await requireUserId();
  await getProjectRepository().restore(projectId, userId);
  revalidatePath("/projects");
  revalidatePath("/trash");
}
