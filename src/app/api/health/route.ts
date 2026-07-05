/**
 * 死活監視 兼 Supabase休止防止エンドポイント。
 * Supabase無料枠は「7日間アクセスがないと休止」するため、
 * Vercelのcron（vercel.json参照）が毎日ここを叩いてDBに軽く触れる。
 */
import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    return NextResponse.json({ ok: true, checkedAt: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "unknown" },
      { status: 500 }
    );
  }
}
