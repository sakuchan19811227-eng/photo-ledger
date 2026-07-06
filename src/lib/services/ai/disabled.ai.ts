/**
 * AI無効時の実装（AI_PROVIDER=none）。
 * isEnabled=false を返すため、UI側はAI関連の表示を出さない。
 * 万一呼ばれた場合は、原因がわかるエラーを投げる。
 */
import type { IAiService, PhotoCategoryId } from "./types";

export class DisabledAiService implements IAiService {
  readonly isEnabled = false;

  async suggestComments(): Promise<string[]> {
    throw new Error(
      "AI機能は無効です。有効化するには docs/06-ai-integration-guide.md の手順で AI_PROVIDER を設定してください。"
    );
  }

  async classifyPhoto(): Promise<PhotoCategoryId> {
    throw new Error(
      "AI機能は無効です。有効化するには docs/06-ai-integration-guide.md の手順で AI_PROVIDER を設定してください。"
    );
  }

  async detectMissingShots(): Promise<string[]> {
    throw new Error(
      "AI機能は無効です。有効化するには docs/06-ai-integration-guide.md の手順で AI_PROVIDER を設定してください。"
    );
  }
}
