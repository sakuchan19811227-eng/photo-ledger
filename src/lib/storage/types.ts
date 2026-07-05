/**
 * ストレージ（写真ファイル置き場）の抽象化層。
 * 使う側は「パス文字列」だけを扱い、実体がSupabaseかGCSかを知らない。
 * 将来のクラウド移行時は、この interface の別実装を追加して切り替える。
 */

export type UploadResult =
  | { ok: true; path: string }
  | { ok: false; message: string };

export interface IStorage {
  /** ファイルを保存する（path例: "{projectId}/{uuid}.jpg"） */
  upload(path: string, data: ArrayBuffer, contentType: string): Promise<UploadResult>;
  /** ファイルの中身を取得する（Excel埋め込み等のサーバー処理用） */
  download(path: string): Promise<ArrayBuffer | null>;
  /** 閲覧用の期限付きURLを発行する */
  getSignedUrl(path: string, expiresInSeconds: number): Promise<string | null>;
  /** ファイルを削除する */
  remove(paths: string[]): Promise<void>;
}
