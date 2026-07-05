/**
 * IStorage の Supabase Storage 実装（バケット: photos / 非公開）。
 * アクセス権はストレージ側のRLSポリシー（現場の所有者のみ）でも守られている。
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { IStorage, UploadResult } from "./types";

const BUCKET = "photos";

export class SupabaseStorage implements IStorage {
  constructor(private readonly client: SupabaseClient) {}

  async upload(
    path: string,
    data: ArrayBuffer,
    contentType: string
  ): Promise<UploadResult> {
    const { error } = await this.client.storage
      .from(BUCKET)
      .upload(path, data, { contentType, upsert: false });
    if (error) {
      return { ok: false, message: error.message };
    }
    return { ok: true, path };
  }

  async getSignedUrl(path: string, expiresInSeconds: number): Promise<string | null> {
    const { data, error } = await this.client.storage
      .from(BUCKET)
      .createSignedUrl(path, expiresInSeconds);
    if (error || !data) return null;
    return data.signedUrl;
  }

  async remove(paths: string[]): Promise<void> {
    if (paths.length === 0) return;
    await this.client.storage.from(BUCKET).remove(paths);
  }
}
