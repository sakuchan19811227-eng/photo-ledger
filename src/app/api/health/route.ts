/**
 * 死活監視 兼 Supabase休止防止エンドポイント。
 * Supabase無料枠は「7日間アクティビティがないと休止」するため、
 * Vercelのcron（vercel.json参照）が毎日ここを叩く。
 *
 * 重要: Supabaseの休止判定は「APIゲートウェイを通った通信」だけを
 * アクティビティとして数える。DB直結（DATABASE_URL経由）だけでは
 * カウントされないため、必ず両方に触れること。
 * （2026-07-14に警告メールが届いた実績あり＝DB直結のみでは不十分）
 */
import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { getServerConfig, publicConfig } from "@/lib/config";

export async function GET() {
  const result = {
    ok: false,
    db: false,
    supabaseApi: false,
    checkedAt: new Date().toISOString(),
  };

  // 1. DB直結の確認（アプリ自体の死活）
  try {
    await db.execute(sql`select 1`);
    result.db = true;
  } catch {
    // resultに反映済み
  }

  // 2. SupabaseのAPIゲートウェイ経由のアクセス（休止防止はこちらが本命）
  try {
    const { supabaseServiceRoleKey } = getServerConfig();
    const res = await fetch(
      `${publicConfig.supabaseUrl}/rest/v1/users?select=id&limit=1`,
      {
        headers: {
          apikey: supabaseServiceRoleKey,
          Authorization: `Bearer ${supabaseServiceRoleKey}`,
        },
        cache: "no-store",
      }
    );
    result.supabaseApi = res.ok;
  } catch {
    // resultに反映済み
  }

  result.ok = result.db && result.supabaseApi;
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
