/**
 * 認証の抽象化層（interface）。
 * 画面やサービス層はこの interface だけに依存し、Supabase を直接知らない。
 * 将来 GCP 等へ移行する場合は、この interface の別実装を書いて差し替える。
 */

/** ログイン中のユーザー情報 */
export type AuthUser = {
  id: string;
  email: string | null;
};

/** 認証操作の結果 */
export type AuthResult =
  | { ok: true; needsEmailConfirmation?: boolean }
  | { ok: false; message: string };

export interface IAuthService {
  /** 新規登録 */
  signUp(email: string, password: string, name: string): Promise<AuthResult>;
  /** ログイン */
  signIn(email: string, password: string): Promise<AuthResult>;
  /** ログアウト */
  signOut(): Promise<void>;
  /** パスワード再設定メールの送信 */
  requestPasswordReset(email: string, redirectTo: string): Promise<AuthResult>;
  /** ログイン中ユーザーのパスワード変更 */
  updatePassword(newPassword: string): Promise<AuthResult>;
  /** 現在のログインユーザーを取得（未ログインなら null） */
  getCurrentUser(): Promise<AuthUser | null>;
}
