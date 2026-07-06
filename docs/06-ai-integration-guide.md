# 06. AI機能 導入手順書

本アプリはAI機能を**後から追加しやすい構造**で設計されている（指示書Phase5対応）。
本書は、将来AI機能（コメント自動生成・写真分類・撮り忘れ検知）を実装する開発者向けの手順書。

---

## 1. すでに用意されている受け口

| ファイル | 役割 |
|---|---|
| `src/lib/services/ai/types.ts` | `IAiService` interface（3つのAI機能の型定義） |
| `src/lib/services/ai/disabled.ai.ts` | 無効時の実装（現在はこれが動いている） |
| `src/lib/services/ai/index.ts` | 実装の切替工場（`AI_PROVIDER` 環境変数で切替） |
| `.env.local` の `AI_PROVIDER` | `none`（無効）/ 将来 `anthropic` 等 |

**設計ルール**: 画面・Server Action は `getAiService()` 経由でしかAIに触れない。
AIプロバイダを変えても、このフォルダの中だけの変更で済む。

## 2. 推奨AI: Claude API（Anthropic）

写真（画像）を理解できるマルチモーダルAIが必要。推奨は **Claude API**。

| 項目 | 内容 |
|---|---|
| 推奨モデル | `claude-opus-4-8`（画像入力対応・高精度） |
| 料金 | 入力 $5 / 出力 $25（100万トークンあたり） |
| 写真1枚あたりの目安 | 画像＋指示で約2,000トークン入力・約100トークン出力 ≒ **1〜3円/枚** |
| SDK | `@anthropic-ai/sdk`（TypeScript） |

※ポートフォリオ用途なら、AIボタンを押した時だけ課金される従量制なので月数十円〜で運用可能。

## 3. 導入手順

### 3-1. APIキーの取得と設定

1. https://console.anthropic.com/ でアカウント作成 → APIキーを発行
2. `.env.local`（とVercelの環境変数）に設定:
   ```env
   AI_PROVIDER=anthropic
   ANTHROPIC_API_KEY=sk-ant-xxxx...
   ```
3. `lib/config` に `anthropicApiKey` を追加（`getServerConfig()` 内）

### 3-2. SDKのインストール

```bash
npm install @anthropic-ai/sdk
```

### 3-3. 実装ファイルの作成

`src/lib/services/ai/anthropic.ai.ts` を作成し、`IAiService` を実装する。
コメント生成の実装例（画像をbase64で送る基本形）:

```typescript
import Anthropic from "@anthropic-ai/sdk";
import type { IAiService, PhotoCategoryId } from "./types";

export class AnthropicAiService implements IAiService {
  readonly isEnabled = true;
  private client = new Anthropic(); // ANTHROPIC_API_KEY を自動で読む

  async suggestComments(image: ArrayBuffer, mimeType: string): Promise<string[]> {
    const base64 = Buffer.from(image).toString("base64");

    const response = await this.client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType as "image/jpeg" | "image/png" | "image/webp",
                data: base64,
              },
            },
            {
              type: "text",
              text:
                "これは建設現場の工事写真です。工事写真台帳に記載する簡潔なコメント候補を" +
                "日本語で3つ、1行ずつ出力してください。例:「基礎配筋施工状況」「型枠組立完了」。" +
                "候補のみを出力し、説明や番号は不要です。",
            },
          ],
        },
      ],
    });

    const text = response.content.find((b) => b.type === "text")?.text ?? "";
    return text.split("\n").map((s) => s.trim()).filter(Boolean).slice(0, 3);
  }

  // classifyPhoto / detectMissingShots も同様のパターンで実装する
  // （分類は structured outputs = output_config.format を使うと確実）
  async classifyPhoto(image: ArrayBuffer, mimeType: string): Promise<PhotoCategoryId> {
    throw new Error("未実装");
  }
  async detectMissingShots(): Promise<string[]> {
    throw new Error("未実装");
  }
}
```

### 3-4. 切替工場に登録

`src/lib/services/ai/index.ts` のコメントアウトを外す:

```typescript
import { AnthropicAiService } from "./anthropic.ai";
// ...
switch (aiProvider) {
  case "anthropic":
    aiService = new AnthropicAiService();
    break;
  // ...
}
```

### 3-5. UIへの組み込みポイント

| AI機能 | 組み込み場所 | 実装イメージ |
|---|---|---|
| コメント生成 | `PhotoGrid.tsx` のコメント欄付近 | 「AI提案」ボタン → Server Action（`storage.download` で画像取得 → `suggestComments`）→ 候補をボタンで表示、タップで入力欄へ |
| 写真分類 | アップロード時（`photo-actions.ts`） | `classifyPhoto` の結果を photos テーブルの新カラム `category` に保存（要マイグレーション） |
| 撮り忘れ検知 | 現場詳細ページ | 「チェック」ボタン → コメント一覧を `detectMissingShots` に渡し、警告を表示 |

いずれも `getAiService().isEnabled` が false のときはUIを出さないこと（AIなしでも完全動作を維持）。

## 4. 注意事項

- **APIキーは秘密情報**。`.env.local` とVercel環境変数のみに置き、コードやGitに含めない
- **コスト管理**: Anthropicコンソールで利用上限（Spend Limit）を設定しておくと安心
- **エラー処理**: AI呼び出し失敗は本来の機能（手入力）を妨げないこと。try/catchして「AI提案を取得できませんでした」程度の表示に留める
- モデルは進化が速い。実装時点の最新モデル・料金を https://platform.claude.com/docs で確認すること
