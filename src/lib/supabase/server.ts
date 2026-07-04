/**
 * サーバー（Server Component / Server Action / Route Handler）用の
 * Supabase クライアント。ログイン状態は Cookie で管理される。
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { publicConfig } from "@/lib/config";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    publicConfig.supabaseUrl,
    publicConfig.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component から呼ばれた場合、Cookieの書き込みはできない。
            // セッション更新は middleware 側が担うため、ここでは無視してよい。
          }
        },
      },
    }
  );
}
