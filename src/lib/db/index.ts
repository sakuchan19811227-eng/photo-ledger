/**
 * DB接続クライアント（サーバー側専用）。
 * 接続先は環境変数 DATABASE_URL（lib/config 経由）で切り替わるため、
 * 将来 GCP Cloud SQL 等へ移行してもこのファイルはほぼそのまま使える。
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getServerConfig } from "@/lib/config";
import * as schema from "./schema";

// 開発中のホットリロードで接続が増え続けないよう、グローバルに1つだけ保持する
const globalForDb = globalThis as unknown as {
  dbClient?: ReturnType<typeof postgres>;
};

function createClient() {
  const { databaseUrl } = getServerConfig();
  return postgres(databaseUrl, {
    // Supabaseの接続プーラ経由でも安全に動く設定
    prepare: false,
    max: 5,
  });
}

const client = globalForDb.dbClient ?? createClient();
if (process.env.NODE_ENV !== "production") {
  globalForDb.dbClient = client;
}

export const db = drizzle(client, { schema });
export { schema };
