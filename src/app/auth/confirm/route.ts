/**
 * メール内リンクからの戻り先。
 * パスワード再設定・メール確認のリンクを開いたとき、ここでログイン状態を
 * 確立してから目的のページ（next パラメータ）へ送る。
 */
import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/projects";

  const supabase = await createSupabaseServerClient();

  // パターン1: token_hash 形式（推奨テンプレート）
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // パターン2: code 形式（PKCEフロー）
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // 失敗時はログインへ（リンク切れ・期限切れなど）
  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl);
}
