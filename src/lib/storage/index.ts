/**
 * ストレージの入口。STORAGE_PROVIDER 環境変数で実装を切り替える。
 * （今は supabase のみ。将来 "gcs" などを追加）
 */
import { getServerConfig } from "@/lib/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SupabaseStorage } from "./supabase.storage";
import type { IStorage } from "./types";

export type { IStorage, UploadResult } from "./types";

export async function getServerStorage(): Promise<IStorage> {
  const { storageProvider } = getServerConfig();

  switch (storageProvider) {
    case "supabase": {
      const client = await createSupabaseServerClient();
      return new SupabaseStorage(client);
    }
    default:
      throw new Error(
        `未対応のストレージ種別です: ${storageProvider}（.env.local の STORAGE_PROVIDER を確認してください）`
      );
  }
}
