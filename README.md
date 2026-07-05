# photo-ledger — 建設業向け写真台帳管理アプリ

「写真をアップロードするだけで、写真台帳作成を30分以内に終わらせる」ためのWebアプリです。

**🌐 公開デモ: https://photo-ledger-rho.vercel.app**（無料で新規登録して試せます）

## 技術スタック

- **フロント**: Next.js (App Router) + TypeScript + Tailwind CSS
- **バックエンド**: Supabase（PostgreSQL / Auth / Storage）
- **ORM**: Drizzle ORM
- **出力**: ExcelJS（Excel台帳）/ Puppeteer（PDF）

## 設計ドキュメント

| ファイル | 内容 |
|---|---|
| [docs/01-architecture-and-structure.md](docs/01-architecture-and-structure.md) | アーキテクチャ方針・フォルダ構成 |
| [docs/02-database-design.md](docs/02-database-design.md) | DB設計（テーブル・RLS） |
| [docs/03-libraries-and-setup.md](docs/03-libraries-and-setup.md) | ライブラリ一覧・環境構築手順 |
| [docs/04-user-manual.md](docs/04-user-manual.md) | **取扱説明書**（利用者向け・順序立てた使い方） |
| [docs/05-specifications.md](docs/05-specifications.md) | **仕様書**（搭載機能・使用技術の一覧） |
| [supabase/schema.sql](supabase/schema.sql) | Supabaseで実行する初期構築SQL |

## 開発の始め方

```bash
# 1. 依存パッケージのインストール
npm install

# 2. 環境変数の設定（.env.local.example をコピーして値を埋める）
copy .env.local.example .env.local

# 3. 開発サーバー起動
npm run dev
```

→ http://localhost:3000 を開く

## フォルダ構成（要点）

```
src/
├── app/          # 画面とAPI（Next.js App Router）
├── components/   # 画面部品
└── lib/
    ├── config/        # 環境変数の一元管理（.env を読むのはここだけ）
    ├── db/            # Drizzle クライアント + スキーマ
    ├── repositories/  # ★DBアクセス抽象化（クラウド移行の切替点）
    ├── storage/       # ★ストレージ抽象化
    ├── auth/          # ★認証抽象化
    ├── services/      # 業務ロジック（excel / pdf / audit / ai）
    └── utils/         # EXIF読取・日付整形など
```

詳細は [docs/01-architecture-and-structure.md](docs/01-architecture-and-structure.md) を参照。

## 開発フェーズ

| Phase | 内容 | 状態 |
|---|---|---|
| 1 | 認証 / 現場管理 / 写真アップロード | ✅ 完了 |
| 2 | 写真一覧 / コメント入力 / 並び替え / 一括選択 | ✅ 完了 |
| 3 | Excel出力 / PDF出力（永久無料構成） | ✅ 完了 |
| 4 | ログ管理 / 管理画面 | 未着手 |
| 5 | AI追加しやすい構造へリファクタ | 未着手 |
