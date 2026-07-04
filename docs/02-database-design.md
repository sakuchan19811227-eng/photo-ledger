# 02. データベース設計

指示書の「推奨DB設計」をベースに、実運用で必要な制約・型・削除方式を補ったものです。
方式は **論理削除（`is_deleted`）** と **操作ログ（`audit_logs`）** を採用します。

---

## テーブル一覧

| テーブル | 役割 |
|---|---|
| `users` | ユーザープロフィール（認証本体は Supabase の `auth.users`）|
| `projects` | 現場（工事案件）|
| `photos` | 写真とコメント |
| `audit_logs` | 操作ログ（管理者のみ閲覧）|

> Supabase Auth は `auth.users` にメール・パスワードを管理します。
> 本アプリの `public.users` は「役割・氏名・有効/無効」などの**業務用プロフィール**を持ち、`auth.users.id` と1対1で紐づきます（サインアップ時に自動作成）。

---

## users

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK, = auth.users.id | 認証ユーザーと一致 |
| name | text | | 氏名 |
| email | text | not null | メール |
| role | text | not null, default `'general'` | `'admin'` / `'general'` |
| is_active | boolean | not null, default `true` | 無効化フラグ |
| created_at | timestamptz | not null, default now() | |
| updated_at | timestamptz | not null, default now() | |

## projects

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK, default gen_random_uuid() | |
| user_id | uuid | not null, FK→users.id | 所有者 |
| project_name | text | not null | 現場名 |
| construction_name | text | | 工事名 |
| customer_name | text | | 顧客名 |
| start_date | date | | 工期開始 |
| end_date | date | | 工期終了 |
| memo | text | | 備考 |
| is_deleted | boolean | not null, default `false` | 論理削除 |
| created_at | timestamptz | not null, default now() | |
| updated_at | timestamptz | not null, default now() | |

> 指示書の項目に「工事名」を追加（現場名と工事名を分けたいケースが多いため）。不要なら削除可。

## photos

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK, default gen_random_uuid() | |
| project_id | uuid | not null, FK→projects.id | 所属現場 |
| file_name | text | not null | 元ファイル名 |
| storage_path | text | not null | ストレージ内のパス（URLではなくパスで保持）|
| comment | text | | 写真コメント |
| taken_at | timestamptz | | 撮影日時（EXIF由来）|
| sort_order | integer | not null, default 0 | 並び替え用 |
| created_by | uuid | FK→users.id | 登録者 |
| is_deleted | boolean | not null, default `false` | 論理削除 |
| created_at | timestamptz | not null, default now() | 登録日時 |
| updated_at | timestamptz | not null, default now() | |

> `storage_path` は**パス文字列**で保持し、公開URLは都度ストレージ層で生成します
> （オブジェクトストレージ移行時にURL形式が変わっても影響を受けないため）。
> 指示書にない `sort_order` を追加（写真の並び替え要件のため）。

## audit_logs

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK, default gen_random_uuid() | |
| user_id | uuid | FK→users.id | 実行者 |
| action | text | not null | `login` / `logout` / `create` / `update` / `delete` / `export_excel` / `export_pdf` |
| table_name | text | | 対象テーブル |
| target_id | uuid | | 対象レコードID |
| metadata | jsonb | | 補足情報（変更内容など）|
| created_at | timestamptz | not null, default now() | |

---

## 権限（RLS: Row Level Security）の方針

| テーブル | 一般ユーザー | 管理者 |
|---|---|---|
| users | 自分の行のみ閲覧・更新 | 全行 閲覧・更新 |
| projects | 自分の現場のみ CRUD | 全現場 閲覧 |
| photos | 自分の現場の写真のみ CRUD | 全写真 閲覧 |
| audit_logs | 不可 | 閲覧のみ |

- 実際のポリシーは `supabase/schema.sql` に実装済みです。
- 「削除」は物理削除せず `is_deleted = true` に更新。**ゴミ箱**は `is_deleted = true` の一覧、**復元**は `false` に戻す操作です。

---

## ER図（簡易）

```
auth.users ──1:1──> users ──1:N──> projects ──1:N──> photos
                     │                                  ▲
                     └──────────── created_by ──────────┘
users ──1:N──> audit_logs
```
