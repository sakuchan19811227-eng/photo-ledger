/**
 * AIサービスの入口。AI_PROVIDER 環境変数で実装を切り替える。
 *
 * 現在: "none"（無効）のみ。
 * 将来: "anthropic" を追加する場合は、
 *   1. anthropic.ai.ts に AnthropicAiService（IAiService実装）を作成
 *   2. 下の switch に case "anthropic" を追加
 * だけでよい。手順の詳細は docs/06-ai-integration-guide.md 参照。
 */
import { getServerConfig } from "@/lib/config";
import { DisabledAiService } from "./disabled.ai";
import type { IAiService } from "./types";

export type { IAiService, PhotoCategoryId } from "./types";
export { PHOTO_CATEGORIES } from "./types";

let aiService: IAiService | undefined;

export function getAiService(): IAiService {
  if (aiService) return aiService;

  const { aiProvider } = getServerConfig();

  switch (aiProvider) {
    // case "anthropic":
    //   aiService = new AnthropicAiService();
    //   break;
    case "none":
    default:
      aiService = new DisabledAiService();
      break;
  }

  return aiService;
}
