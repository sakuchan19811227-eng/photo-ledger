# 03. 必要ライブラリと環境構築手順

環境はこれから準備する前提（Node.js / Supabase いずれも未設定）で、**初心者向けに手順を丁寧に**書いています。
※このドキュメントは「これから何を入れるか」の一覧と準備手順です。実際のインストールは合意後に行います。

---

## A. 必要ライブラリ一覧

### 本体（実行時に使う）
| ライブラリ | 用途 |
|---|---|
| `next` / `react` / `react-dom` | フロント本体（App Router）|
| `typescript` | 型安全 |
| `tailwindcss` `postcss` `autoprefixer` | スタイリング |
| `@supabase/supabase-js` | Supabase接続（DB/認証/ストレージ）|
| `@supabase/ssr` | Next.jsサーバー側での認証セッション管理 |
| `drizzle-orm` `postgres` | ORM（DBアクセス）|
| `exceljs` | Excel台帳出力（画像埋め込み対応）|
| `puppeteer` | PDF出力（HTML→PDF）|
| `exifr` | 写真の撮影日時(EXIF)読み取り |
| `zod` | 入力バリデーション |
| `react-dropzone` | ドラッグ&ドロップ アップロード |

### 開発用（開発時のみ）
| ライブラリ | 用途 |
|---|---|
| `drizzle-kit` | スキーマからのマイグレーション生成 |
| `@types/node` 他 | 型定義 |
| `eslint` `prettier` | 品質・整形 |

> 予定インストールコマンド（合意後に実行します。まだ実行しないでください）:
> ```bash
> npm install next react react-dom @supabase/supabase-js @supabase/ssr \
>   drizzle-orm postgres exceljs puppeteer exifr zod react-dropzone
> npm install -D typescript @types/node @types/react drizzle-kit eslint prettier \
>   tailwindcss postcss autoprefixer
> ```

---

## B. 事前準備（あなたにやっていただくこと）

### 1. Node.js のインストール
1. https://nodejs.org/ から **LTS版** をダウンロードしてインストール
2. インストール確認（PowerShellで）:
   ```powershell
   node -v
   npm -v
   ```
   → バージョン番号が表示されればOK（例: `v20.x.x`）

### 2. Supabase プロジェクトの作成
1. https://supabase.com/ にアクセスし、GitHubアカウント等で**サインアップ**
2. 「New project」をクリック
3. 入力:
   - **Name**: `photo-ledger`（任意）
   - **Database Password**: 強力なパスワード（メモしておく）
   - **Region**: `Northeast Asia (Tokyo)` を推奨
4. 作成完了まで1〜2分待つ
5. 左メニュー **Project Settings → API** で次の3つを控える（後で `.env` に使う）:
   - **Project URL**
   - **anon public** キー
   - **service_role** キー（※秘密。サーバー側だけで使用）

### 3. SQLの実行（テーブル作成）
1. Supabase左メニューの **SQL Editor** を開く
2. `supabase/schema.sql` の中身を全部コピーして貼り付け
3. **Run** を押す → 「Success」が出ればテーブル・権限設定が完了

---

## C. 環境変数（.env.local の見本）

実装時にプロジェクト直下へ `.env.local` を作り、以下を設定します（値は上のAPI画面から）。

```env
# クライアントからも参照するもの（公開されてよい情報）
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyxxxx...

# サーバー側だけで使う秘密情報（絶対に公開しない）
SUPABASE_SERVICE_ROLE_KEY=eyxxxx...

# Drizzle が使うDB接続URL（Supabase → Project Settings → Database → Connection string）
DATABASE_URL=postgresql://postgres:[パスワード]@db.xxxx.supabase.co:5432/postgres

# 将来のクラウド移行に備えた切替スイッチ（今は supabase 固定）
STORAGE_PROVIDER=supabase
```

> `.env.local` は Git に含めません（`.gitignore` に登録）。
> `.env.local.example`（値を空にした見本）だけをリポジトリに残します。

---

## D. この後の流れ

1. ✅ 設計3点（アーキテクチャ / DB / SQL / ライブラリ）を提示 ← **今ここ**
2. あなたが **B. 事前準備**（Node.js導入・Supabaseプロジェクト作成・SQL実行）
3. 合意後、こちらで **Phase1** の実装を小さなステップで開始
   - Step 1: Next.jsプロジェクト雛形＋Tailwind＋config層
   - Step 2: Supabase接続＋認証（ログイン/登録/ログアウト）
   - Step 3: 現場管理（登録/一覧/編集/削除）
   - Step 4: 写真アップロード（D&D・EXIF・サムネイル）
   - 各Stepの最後に「動作確認手順」を提示します
