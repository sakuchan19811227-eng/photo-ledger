/**
 * ブラウザ（クライアントコンポーネント）用の Supabase クライアント。
 * 公開してよい設定（URL / anonキー）だけを使う。
 */
import { createBrowserClient } from "@supabase/ssr";
import { publicConfig } from "@/lib/config";

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    publicConfig.supabaseUrl,
    publicConfig.supabaseAnonKey
  );
}
