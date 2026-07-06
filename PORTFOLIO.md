# 📷 photo-ledger — 建設業向け写真台帳管理アプリ

> **「写真をアップロードするだけで、工事写真台帳の作成を30分以内に終わらせる」**

建設業では今も、現場写真を1枚ずつExcelに貼り付けて台帳を作る作業に1案件1〜3時間かかっています。
本アプリはその作業を「アップロード → コメント入力 → ボタン1つでExcel/PDF出力」に置き換えるWebアプリです。

## 🔗 リンク

| | URL |
|---|---|
| **🌐 公開デモ（スマホ対応）** | https://photo-ledger-rho.vercel.app |
| **💻 ソースコード** | https://github.com/sakuchan19811227-eng/photo-ledger |
| **📖 設計ドキュメント一式** | [docs/](docs/)（アーキテクチャ / DB設計 / 取扱説明書 / 仕様書 / AI導入手順書） |

**デモアカウント**（サンプルの現場・写真入り。新規登録でもすぐ試せます）

```
メール: claude.test.photoledger@gmail.com
パスワード: test-pass-123456
```

## ✨ 主な機能

- **認証** — 新規登録 / ログイン / パスワード再設定（メールリンク）
- **現場管理** — 登録・編集・検索・論理削除・ゴミ箱からの復元
- **写真管理** — ドラッグ＆ドロップで複数枚アップロード（スマホはタップ選択）、**EXIF撮影日時の自動読取**、コメント入力、並び替え、検索、一括削除
- **台帳出力** — **工事写真台帳形式のExcel**（写真埋め込み・A4縦1ページ3枚・テンプレート化）と**提出用PDF**
- **管理機能** — 操作ログ13種の自動記録、ユーザー管理（無効化）、削除データ確認（管理者ロールのみ）

## 🏗 技術スタック

| 分類 | 技術 |
|---|---|
| フロント/サーバー | Next.js 16（App Router / Server Actions / TypeScript / Tailwind CSS） |
| バックエンド | Supabase（PostgreSQL / Auth / Storage） |
| ORM | Drizzle ORM |
| 出力 | ExcelJS + sharp（Excel台帳生成）、印刷ビュー方式PDF |
| インフラ | Vercel（CI/CD: mainへのpushで自動デプロイ） |

## 🎯 設計の見どころ

**1. クラウド移行を見据えた抽象化アーキテクチャ**
DB・ストレージ・認証・AIへのアクセスをすべて interface（`IProjectRepository` / `IStorage` / `IAuthService` / `IAiService`）の裏に隠し、Supabase依存を薄い実装層に隔離。環境変数1つで実装を差し替えられ、将来のGCP等への移行は実装層の追加だけで完了する構造。
→ 詳細: [docs/01-architecture-and-structure.md](docs/01-architecture-and-structure.md)

**2. 月額0円で永久稼働するインフラ設計**
Vercel Hobby＋Supabase Free で構成し、無料枠の罠（Supabaseの7日間無アクセス休止）を **Vercel Cron による毎日の死活監視ping** で回避。PDF生成はサーバーレスで不安定なPuppeteerを避けて**印刷ビュー方式**を採用し、コストゼロと確実な動作を両立。

**3. セキュリティ**
行レベルの認可（全クエリでユーザーIDスコープを強制＋DB側RLSポリシー）、写真は非公開バケット＋期限付き署名URL、middleware（proxy）による認証ガード、ロールベースの管理画面アクセス制御、監査ログ。

**4. AI拡張の受け入れ構造**
AIコメント自動生成・写真分類・撮り忘れ検知を将来追加できる interface と切替機構を実装済み（AIなしでも完全動作）。導入手順書つき。
→ [docs/06-ai-integration-guide.md](docs/06-ai-integration-guide.md)

## 📚 ドキュメント

| ドキュメント | 内容 |
|---|---|
| [01 アーキテクチャ設計](docs/01-architecture-and-structure.md) | 抽象化層の設計思想・フォルダ構成 |
| [02 DB設計](docs/02-database-design.md) | テーブル定義・RLS・トリガー |
| [03 環境構築手順](docs/03-libraries-and-setup.md) | セットアップガイド |
| [04 取扱説明書](docs/04-user-manual.md) | 利用者向けマニュアル（非エンジニア向け） |
| [05 仕様書](docs/05-specifications.md) | 全機能・使用技術の一覧 |
| [06 AI導入手順書](docs/06-ai-integration-guide.md) | 将来のAI機能実装ガイド |

## 🛠 開発プロセス

- 要件定義書（開発指示書）に基づく5フェーズの段階的開発。各フェーズで動作検証を行いコミット（計10コミット超）
- AIコーディングエージェント（Claude Code）を活用したペア開発。設計判断・検証・ドキュメント整備までを一貫して実施
