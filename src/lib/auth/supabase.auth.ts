/**
 * IAuthService の Supabase 実装。
 * Supabase Auth の API 呼び出しと、エラーメッセージの日本語化を担当。
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AuthResult, AuthUser, IAuthService } from "./types";

/** Supabaseの英語エラーを、利用者向けの日本語に変換する */
function toJapaneseMessage(englishMessage: string): string {
  const table: Array<[RegExp, string]> = [
    [/invalid login credentials/i, "メールアドレスまたはパスワードが違います"],
    [/user already registered/i, "このメールアドレスは登録済みです"],
    [
      /email not confirmed/i,
      "メールアドレスの確認が済んでいません。届いた確認メールのリンクを開いてください",
    ],
    [
      /password should be at least (\d+) characters/i,
      "パスワードが短すぎます（6文字以上にしてください）",
    ],
    [/unable to validate email address/i, "メールアドレスの形式が正しくありません"],
    [/email rate limit exceeded/i, "メール送信の回数制限に達しました。しばらく待ってからやり直してください"],
    [/for security purposes.*request this after/i, "操作が早すぎます。少し待ってからやり直してください"],
    [/new password should be different/i, "新しいパスワードは今までと違うものにしてください"],
  ];
  for (const [pattern, japanese] of table) {
    if (pattern.test(englishMessage)) return japanese;
  }
  return `エラーが発生しました: ${englishMessage}`;
}

export class SupabaseAuthService implements IAuthService {
  constructor(private readonly client: SupabaseClient) {}

  async signUp(email: string, password: string, name: string): Promise<AuthResult> {
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: {
        // ここで渡した name は、DB側トリガーが public.users.name に反映する
        data: { name },
      },
    });
    if (error) return { ok: false, message: toJapaneseMessage(error.message) };
    // メール確認がONの場合、この時点ではセッションがない（=確認待ち）
    return { ok: true, needsEmailConfirmation: data.session === null };
  }

  async signIn(email: string, password: string): Promise<AuthResult> {
    const { error } = await this.client.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, message: toJapaneseMessage(error.message) };
    return { ok: true };
  }

  async signOut(): Promise<void> {
    await this.client.auth.signOut();
  }

  async requestPasswordReset(email: string, redirectTo: string): Promise<AuthResult> {
    const { error } = await this.client.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) return { ok: false, message: toJapaneseMessage(error.message) };
    return { ok: true };
  }

  async updatePassword(newPassword: string): Promise<AuthResult> {
    const { error } = await this.client.auth.updateUser({ password: newPassword });
    if (error) return { ok: false, message: toJapaneseMessage(error.message) };
    return { ok: true };
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const { data } = await this.client.auth.getUser();
    if (!data.user) return null;
    return { id: data.user.id, email: data.user.email ?? null };
  }
}
