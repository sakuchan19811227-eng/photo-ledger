/**
 * drizzle-kit（マイグレーション生成ツール）の設定。
 * 現状テーブルは supabase/schema.sql で作成済みのため、
 * 将来スキーマ変更する際に `npx drizzle-kit generate` で差分SQLを作る用途。
 */
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./supabase/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});
