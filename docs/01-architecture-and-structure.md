# 01. アーキテクチャ方針とフォルダ構成

建設業向け写真台帳管理アプリ（コードネーム: `photo-ledger`）の設計基盤です。
本ドキュメントは**設計提案**であり、まだ実装コードは含みません。内容を確認・合意のうえで実装に進みます。

---

## 1. 設計の核となる考え方

指示書の「将来のクラウド移行を容易にする」要件を満たすため、
**特定サービス（Supabase）への依存を"薄い境界（アダプター層）"に閉じ込める**構成にします。

```
┌─────────────────────────────────────────────┐
│  画面 (Next.js App Router / React)           │  ← UIはインフラを知らない
├─────────────────────────────────────────────┤
│  サービス層 (services/)                       │  ← 業務ロジック。Excel/PDF/将来AI
├─────────────────────────────────────────────┤
│  抽象化層 (repositories/ storage/ auth/)      │  ← ★ここが移行の要（interface）
├─────────────────────────────────────────────┤
│  実装 (Supabase実装 / 将来: GCP実装)          │  ← 差し替え可能
└─────────────────────────────────────────────┘
```

### なぜこうするか（指示書の設計要件との対応）

| 指示書の要件 | 本設計での実現方法 |
|---|---|
| インフラ依存を排除 | 抽象化層（interface）にDB・ストレージ・認証を隠す |
| 環境変数で設定切替 | `lib/config` で一元管理。`.env` を読むのはここだけ |
| DBアクセスを抽象化 | `repositories/` に `IProjectRepository` 等の interface を定義 |
| ストレージを抽象化 | `storage/` に `IStorage` interface（`SupabaseStorage` → 将来 `GcsStorage`）|
| AI機能をサービス層で分離 | `services/ai/` を最初から空の枠として用意（Phase5で中身を実装）|
| Docker化しやすい | 環境変数のみで動く／`Dockerfile` を用意 |
| ORMを利用 | **Drizzle ORM**（後述）でスキーマとクエリを型安全に |
| オブジェクトストレージ移行を想定 | 保存は「パス文字列」で管理し、URL生成はストレージ層に任せる |

---

## 2. 技術選定（指示書に沿った確定案）

| 分類 | 採用 | 補足 |
|---|---|---|
| フロント | Next.js (App Router) + TypeScript + Tailwind CSS | 指示書どおり |
| バックエンド | Next.js Route Handlers + Supabase | サーバー処理はNext.js内に集約 |
| DB | PostgreSQL (Supabase) | 指示書どおり |
| ORM | **Drizzle ORM** | ※下の「ORM選定理由」参照 |
| 認証 | Supabase Auth | 指示書どおり。抽象化層で包む |
| ストレージ | Supabase Storage | 指示書どおり。抽象化層で包む |
| Excel出力 | ExcelJS | 画像埋め込み対応 |
| PDF出力 | Puppeteer（HTML→PDF）| 台帳レイアウトをHTMLで作りPDF化 |
| ホスティング | Vercel（開発）→ エックスサーバー（初期運用）| |

### ORM選定理由（Drizzle を推奨）

- **移行が楽**: 生成されるのは素直なSQLに近く、将来 GCP Cloud SQL 等の純粋なPostgresへ移しても通用する
- **型安全**: TypeScriptでスキーマを書くとクエリも型補完される
- **軽量**: Supabaseの接続プーラ（pgbouncer）とも相性がよく、初心者がハマりにくい
- 代替候補: **Prisma**（スキーマファイルが読みやすい）。もしPrismaがよければ切替可能です。抽象化層のおかげでORMは後からでも差し替えられます。

---

## 3. フォルダ構成（提案）

```
photo-ledger/
├── src/
│   ├── app/                         # 画面とAPI（Next.js App Router）
│   │   ├── (auth)/                  # ログイン前の画面グループ
│   │   │   ├── login/               #   ログイン
│   │   │   ├── register/            #   新規登録
│   │   │   └── reset-password/      #   パスワード再設定
│   │   ├── (dashboard)/             # ログイン後の画面グループ
│   │   │   ├── projects/            #   現場一覧
│   │   │   │   ├── [id]/            #   現場詳細（写真管理）
│   │   │   │   └── new/             #   現場登録
│   │   │   ├── trash/               #   ゴミ箱（復元）
│   │   │   └── admin/               #   管理画面（ユーザー/ログ）
│   │   ├── api/                     # サーバー処理（Route Handlers）
│   │   │   ├── export/excel/        #   Excel出力
│   │   │   └── export/pdf/          #   PDF出力
│   │   ├── layout.tsx
│   │   └── page.tsx                 # トップ（ログインへ誘導）
│   │
│   ├── components/                  # 画面部品（ボタン・アップローダ等）
│   │   ├── ui/                      #   汎用UI
│   │   ├── projects/                #   現場関連
│   │   └── photos/                  #   写真関連
│   │
│   ├── lib/                         # ★ロジックの中心。ここが設計の肝
│   │   ├── config/                  #   環境変数・設定の一元管理（唯一 .env を読む場所）
│   │   ├── db/                      #   Drizzle クライアント + スキーマ定義
│   │   │   └── schema.ts
│   │   ├── repositories/            #   ★DBアクセス抽象化（interface + 実装）
│   │   │   ├── types.ts             #     IProjectRepository など interface
│   │   │   ├── project.repository.ts
│   │   │   ├── photo.repository.ts
│   │   │   └── user.repository.ts
│   │   ├── storage/                 #   ★ストレージ抽象化
│   │   │   ├── types.ts             #     IStorage interface
│   │   │   └── supabase.storage.ts  #     Supabase実装（将来 gcs.storage.ts 追加）
│   │   ├── auth/                    #   ★認証抽象化（Supabase Authを包む）
│   │   ├── services/                #   業務ロジック
│   │   │   ├── excel/               #     Excel台帳生成（テンプレート化）
│   │   │   ├── pdf/                 #     PDF生成
│   │   │   ├── audit/               #     操作ログ記録
│   │   │   └── ai/                  #     ★将来のAI（今は空の枠のみ）
│   │   └── utils/                   #   EXIF読取・日付整形など
│   │
│   ├── types/                       # 共通の型
│   └── styles/
│
├── supabase/
│   ├── schema.sql                   # テーブル・RLS・トリガー（初期構築SQL）
│   └── migrations/                  # 以降の変更履歴
│
├── docs/                            # 本設計ドキュメント群
├── public/
├── .env.local.example               # 必要な環境変数の見本
├── Dockerfile                       # 将来のコンテナ化用
├── drizzle.config.ts
├── next.config.js
├── tailwind.config.ts
├── package.json
└── README.md
```

### ポイント
- **`lib/config` 以外は `.env` を直接読まない** → 移行時はここだけ直せばよい
- **`services/ai/` を最初から用意** → 指示書「AIを後から追加しやすく」を構造で担保
- **`repositories/` `storage/` `auth/` の3つの抽象化層** → クラウド移行の切替点はここに集約

---

## 4. 開発フェーズ（指示書の開発方針に対応）

| Phase | 内容 | 主に触るフォルダ |
|---|---|---|
| **1** | 認証 / 現場管理 / 写真アップロード | `auth/` `projects/` `storage/` |
| **2** | 写真一覧 / コメント入力 | `photos/` `repositories/` |
| **3** | Excel出力 / PDF出力 | `services/excel/` `services/pdf/` |
| **4** | ログ管理 / 管理画面 | `services/audit/` `admin/` |
| **5** | AI追加しやすい構造へリファクタ | `services/ai/` |

各フェーズを**さらに小さなステップ**に分け、ステップごとに「動作確認手順」を提示しながら進めます。

---

## 次のアクション
このアーキテクチャ・フォルダ構成でよければ、続けて
- `02-database-design.md`（DB設計）
- `supabase/schema.sql`（実行用SQL）
- `03-libraries-and-setup.md`（ライブラリと環境構築手順）

をご確認ください。合意後、Phase1の実装に着手します。
