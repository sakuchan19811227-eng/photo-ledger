"use server";

/**
 * 認証まわりのサーバー処理（Server Actions）。
 * 画面のフォームから呼ばれ、認証抽象化層（lib/auth）に処理を委譲する。
 */
import { redirect } from "next/navigation";
import { getServerAuthService } from "@/lib/auth";
import { publicConfig } from "@/lib/config";

/** フォームに返す結果の型 */
export type FormState = {
  ok: boolean;
  message: string;
};

export async function loginAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    return { ok: false, message: "メールアドレスとパスワードを入力してください" };
  }

  const auth = await getServerAuthService();
  const result = await auth.signIn(email, password);
  if (!result.ok) return { ok: false, message: result.message };

  redirect("/projects");
}

export async function registerAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

  if (!name || !email || !password) {
    return { ok: false, message: "すべての項目を入力してください" };
  }
  if (password !== passwordConfirm) {
    return { ok: false, message: "パスワード（確認）が一致しません" };
  }
  if (password.length < 6) {
    return { ok: false, message: "パスワードは6文字以上にしてください" };
  }

  const auth = await getServerAuthService();
  const result = await auth.signUp(email, password, name);
  if (!result.ok) return { ok: false, message: result.message };

  if (result.needsEmailConfirmation) {
    return {
      ok: true,
      message:
        "確認メールを送信しました。メール内のリンクを開いてから、ログインしてください。",
    };
  }

  redirect("/projects");
}

export async function logoutAction(): Promise<void> {
  const auth = await getServerAuthService();
  await auth.signOut();
  redirect("/login");
}

export async function resetRequestAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { ok: false, message: "メールアドレスを入力してください" };
  }

  const auth = await getServerAuthService();
  const result = await auth.requestPasswordReset(
    email,
    `${publicConfig.appUrl}/auth/confirm?next=/reset-password/update`
  );
  if (!result.ok) return { ok: false, message: result.message };

  return {
    ok: true,
    message:
      "再設定用のメールを送信しました（登録済みのアドレスの場合）。メール内のリンクを開いてください。",
  };
}

export async function updatePasswordAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

  if (password !== passwordConfirm) {
    return { ok: false, message: "パスワード（確認）が一致しません" };
  }
  if (password.length < 6) {
    return { ok: false, message: "パスワードは6文字以上にしてください" };
  }

  const auth = await getServerAuthService();
  const result = await auth.updatePassword(password);
  if (!result.ok) return { ok: false, message: result.message };

  redirect("/projects");
}
