# 写真台帳（photo-ledger）仕様書

搭載機能と使用技術の一覧。機能追加のたびに本書を更新する。
（最終更新: 2026-07-05 / Phase2完了時点）

---

## 1. 搭載機能一覧

### 認証（Phase1）
| 機能 | 内容 |
|---|---|
| 新規登録 | 名前・メール・パスワード。DB側トリガーでプロフィール自動作成 |
| ログイン / ログアウト | Cookieベースのセッション。エラーは日本語表示 |
| パスワード再設定 | メールのリンク経由で新パスワード設定（/auth/confirm で処理） |
| アクセス制御 | 未ログイン時は保護ページから /login へ自動誘導（middleware） |
| 権限 | users.role = admin / general（管理画面はPhase4で実装予定） |

### 現場管理（Phase1）
| 機能 | 内容 |
|---|---|
| 登録・編集 | 現場名（必須）・工事名・顧客名・工期・備考 |
| 一覧・検索 | 現場名/工事名/顧客名の部分一致（?q=） |
| 削除・復元 | 論理削除（is_deleted）。ゴミ箱ページ（/trash）から復元 |
| データ分離 | 全クエリで user_id を強制。他人の現場は見えない |

### 写真管理（Phase1〜2）
| 機能 | 内容 |
|---|---|
| アップロード | D&D / タップ選択、複数枚同時。JPEG/PNG/WebP/HEIC、20MB/枚 |
| EXIF読取 | 撮影日時（DateTimeOriginal）を自動抽出しDB保存 |
| サムネイル一覧 | 非公開バケット＋署名URL（有効1時間）で表示 |
| コメント入力 | 写真ごとに保存（台帳出力の本文になる） |
| 並び替え | ↑↓ボタンで sort_order を入替 |
| 検索 | コメント/ファイル名の部分一致（?pq=） |
| 一括選択・削除 | チェックボックス＋一括論理削除。写真ゴミ箱から復元 |

### 未実装（今後の予定）
- Phase3: Excel出力（ExcelJS）/ PDF出力（Puppeteer）
- Phase4: 操作ログ（audit_logs テーブルは作成済み）/ 管理画面
- Phase5: AI機能（コメント自動生成・写真分類・撮り忘れ検知）用の枠 `lib/services/ai/` は確保済み

## 2. 使用技術・ツール

### フレームワーク・言語
| 技術 | バージョン | 用途 |
|---|---|---|
| Next.js (App Router) | 16.x | フロント＋サーバー処理（Server Actions） |
| React | 19.x | UI |
| TypeScript | 5.x | 型安全 |
| Tailwind CSS | 4.x | スタイリング |

### バックエンド（Supabase）
| サービス | 用途 |
|---|---|
| Supabase Auth | 認証（メール+パスワード） |
| Supabase PostgreSQL | データベース（東京リージョン） |
| Supabase Storage | 写真ファイル（非公開バケット `photos`） |

### 主要ライブラリ
| ライブラリ | 用途 |
|---|---|
| @supabase/supabase-js / @supabase/ssr | Supabase接続・セッション管理 |
| drizzle-orm + postgres | ORM（型安全なDBアクセス） |
| drizzle-kit | マイグレーション生成（開発用） |
| exifr | EXIF（撮影日時）読取 |
| react-dropzone | ドラッグ＆ドロップ |

## 3. アーキテクチャ（要点）

```
画面 (app/) → サービス層 (lib/services/) → 抽象化層 → 実装
                                   ├ lib/auth/    IAuthService  → Supabase Auth
                                   ├ lib/repositories/ IProjectRepository, IPhotoRepository → Drizzle
                                   └ lib/storage/ IStorage      → Supabase Storage
```

- **環境変数は `lib/config` だけが読む**（切替点の一元化）
- **抽象化層（interface）の裏に Supabase を隠す** → 将来のGCP等への移行はここの差し替えのみ
- DB接続はDrizzle直結のためRLS非適用。**リポジトリ全メソッドで userId / projectId スコープを強制**して認可を担保
- DBのRLSポリシー・トリガー・ストレージポリシーは `supabase/schema.sql` 参照

## 4. データベース（テーブル概要）

| テーブル | 主な列 | 備考 |
|---|---|---|
| users | id, name, email, role, is_active | auth.users と1対1（トリガーで自動作成） |
| projects | project_name, construction_name, customer_name, start_date, end_date, memo, is_deleted | 現場 |
| photos | file_name, storage_path, comment, taken_at, sort_order, created_by, is_deleted | 写真（実体はStorage、パスのみ保持） |
| audit_logs | user_id, action, table_name, target_id, metadata | Phase4で使用開始 |

詳細は [02-database-design.md](02-database-design.md)。

## 5. 環境変数

`.env.local`（見本: `.env.local.example`）

| 変数 | 用途 |
|---|---|
| NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase接続（公開可） |
| SUPABASE_SERVICE_ROLE_KEY | サーバー専用の管理キー（秘密） |
| DATABASE_URL | Drizzle用DB接続文字列（秘密） |
| STORAGE_PROVIDER | ストレージ実装の切替（現在 supabase 固定） |
| NEXT_PUBLIC_APP_URL | メール内リンクの戻り先（未設定時 http://localhost:3000） |

## 6. 関連ドキュメント

- [01-architecture-and-structure.md](01-architecture-and-structure.md) — 設計方針・フォルダ構成
- [02-database-design.md](02-database-design.md) — DB設計の詳細
- [03-libraries-and-setup.md](03-libraries-and-setup.md) — 環境構築手順
- [04-user-manual.md](04-user-manual.md) — 取扱説明書（利用者向け）
