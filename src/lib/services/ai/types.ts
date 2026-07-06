/**
 * AI機能の抽象化層（interface）。
 * 指示書の「将来的なAI機能」3つに対応する受け口を定義する。
 * 実装はまだ無い（AI_PROVIDER=none）。導入手順は docs/06-ai-integration-guide.md 参照。
 *
 * 使う側（画面・Server Action）はこの interface だけに依存すること。
 * どのAI（Claude API等）を使うかは lib/services/ai/index.ts で切り替える。
 */

/** 写真分類のカテゴリ（指示書のAI写真分類に対応） */
export const PHOTO_CATEGORIES = {
  foundation: "基礎工事",
  rebar: "鉄筋工事",
  equipment: "設備工事",
  finishing: "仕上工事",
  other: "その他",
} as const;

export type PhotoCategoryId = keyof typeof PHOTO_CATEGORIES;

export interface IAiService {
  /** AI機能が使える状態か（UIはこれを見てボタンの表示/非表示を決める） */
  readonly isEnabled: boolean;

  /**
   * AIコメント生成: 写真からコメント候補を生成する。
   * 例: 「基礎配筋施工状況」「型枠組立完了」「コンクリート打設前」
   */
  suggestComments(image: ArrayBuffer, mimeType: string): Promise<string[]>;

  /** AI写真分類: 写真を工事カテゴリに分類する */
  classifyPhoto(image: ArrayBuffer, mimeType: string): Promise<PhotoCategoryId>;

  /**
   * AI撮り忘れ検知: 現場の写真コメント一覧から不足している工程を指摘する。
   * 例: 「鉄筋施工前の写真が不足しています。」
   */
  detectMissingShots(input: {
    projectName: string;
    comments: string[];
  }): Promise<string[]>;
}
