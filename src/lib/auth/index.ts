/**
 * 認証サービスの入口。使う側はこの関数だけ呼べばよい。
 * （どの実装＝Supabaseを使うかは、ここで決めている）
 */
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SupabaseAuthService } from "./supabase.auth";
import type { IAuthService } from "./types";

export type { AuthResult, AuthUser, IAuthService } from "./types";

/** サーバー側（Server Action / Server Component）用の認証サービスを得る */
export async function getServerAuthService(): Promise<IAuthService> {
  const client = await createSupabaseServerClient();
  return new SupabaseAuthService(client);
}
