/**
 * 環境変数の一元管理。
 *
 * ルール: .env を直接読む（process.env に触る）のはこのファイルだけ。
 * 他の場所では必ずここから import して使う。
 * 将来クラウド移行（Supabase → GCP等）するときは、このファイルと
 * 抽象化層（repositories/ storage/ auth/）の実装だけを差し替えればよい。
 */

/** クライアント（ブラウザ）からも参照できる公開設定 */
export const publicConfig = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  /** このアプリ自身のURL（メール内リンクの戻り先などに使用） */
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
} as const;

/** サーバー側だけで使う秘密設定。クライアントから呼ぶとエラーにする */
export function getServerConfig() {
  if (typeof window !== "undefined") {
    throw new Error(
      "getServerConfig() はサーバー側専用です。クライアントコンポーネントから呼ばないでください。"
    );
  }
  return {
    supabaseServiceRoleKey: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    databaseUrl: requireEnv("DATABASE_URL"),
    /** ストレージ実装の切替スイッチ（今は supabase 固定。将来 "gcs" 等を追加） */
    storageProvider: process.env.STORAGE_PROVIDER ?? "supabase",
    /** AI実装の切替スイッチ（今は none=無効。将来 "anthropic" 等を追加） */
    aiProvider: process.env.AI_PROVIDER ?? "none",
  } as const;
}

/** 必須の環境変数が未設定なら、原因がわかるメッセージで即エラーにする */
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `環境変数 ${name} が設定されていません。.env.local を確認してください（見本: .env.local.example）`
    );
  }
  return value;
}

/** 公開設定が揃っているかの簡易チェック（起動時の診断用） */
export function isSupabaseConfigured(): boolean {
  return publicConfig.supabaseUrl !== "" && publicConfig.supabaseAnonKey !== "";
}
