/**
 * すべてのリクエストの前に動く「門番」。
 * 1. Supabase のログインセッション（Cookie）を最新に保つ
 * 2. 未ログインの人が保護ページに来たら /login へ誘導
 * 3. ログイン済みの人が /login 等に来たら /projects へ誘導
 */
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { publicConfig } from "@/lib/config";

/** ログインが必要なページの先頭パス */
const PROTECTED_PREFIXES = ["/projects", "/trash", "/admin"];
/** ログイン済みなら見る必要のないページ */
const AUTH_PAGES = ["/login", "/register"];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    publicConfig.supabaseUrl,
    publicConfig.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // セッションの取得＆必要ならCookieの更新（この呼び出し自体に意味がある）
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  if (!user && PROTECTED_PREFIXES.some((p) => path.startsWith(p))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && AUTH_PAGES.some((p) => path === p)) {
    const url = request.nextUrl.clone();
    url.pathname = "/projects";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // 静的ファイル等を除くすべてのページで動かす
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
