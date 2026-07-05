"use server";

/**
 * 管理画面のサーバー処理。すべて管理者権限を確認してから実行する。
 */
import { revalidatePath } from "next/cache";
import { getServerAuthService } from "@/lib/auth";
import { getUserRepository } from "@/lib/repositories";

/** 実行者が有効な管理者であることを確認し、そのIDを返す（違えば null） */
async function requireAdminId(): Promise<string | null> {
  const auth = await getServerAuthService();
  const user = await auth.getCurrentUser();
  if (!user) return null;
  const appUser = await getUserRepository().findById(user.id);
  if (!appUser || appUser.role !== "admin" || !appUser.isActive) return null;
  return user.id;
}

export type SimpleResult = { ok: boolean; message: string };

/** ユーザーの有効/無効を切り替える */
export async function setUserActiveAction(
  targetUserId: string,
  isActive: boolean
): Promise<SimpleResult> {
  const adminId = await requireAdminId();
  if (!adminId) return { ok: false, message: "権限がありません" };

  if (targetUserId === adminId) {
    return { ok: false, message: "自分自身は無効化できません" };
  }

  const changed = await getUserRepository().setActive(targetUserId, isActive);
  if (!changed) return { ok: false, message: "対象のユーザーが見つかりません" };

  revalidatePath("/admin/users");
  return { ok: true, message: isActive ? "有効化しました" : "無効化しました" };
}
