-- =====================================================================
-- photo-ledger 初期スキーマ
-- Supabase の SQL Editor に貼り付けて実行してください。
-- 内容: テーブル / インデックス / 自動更新トリガー / サインアップ連携 / RLS
-- =====================================================================

-- 拡張（uuid生成用。Supabaseでは通常有効ですが念のため）
create extension if not exists "pgcrypto";

-- =====================================================================
-- 1. テーブル
-- =====================================================================

-- ユーザープロフィール（認証本体は auth.users）
create table if not exists public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text,
  email       text not null,
  role        text not null default 'general' check (role in ('admin', 'general')),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 現場（工事案件）
create table if not exists public.projects (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references public.users(id) on delete cascade,
  project_name       text not null,
  construction_name  text,
  customer_name      text,
  start_date         date,
  end_date           date,
  memo               text,
  is_deleted         boolean not null default false,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- 写真
create table if not exists public.photos (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references public.projects(id) on delete cascade,
  file_name     text not null,
  storage_path  text not null,
  comment       text,
  taken_at      timestamptz,
  sort_order    integer not null default 0,
  created_by    uuid references public.users(id) on delete set null,
  is_deleted    boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- 操作ログ
create table if not exists public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.users(id) on delete set null,
  action      text not null,
  table_name  text,
  target_id   uuid,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);

-- =====================================================================
-- 2. インデックス（検索・一覧の高速化）
-- =====================================================================
create index if not exists idx_projects_user_id     on public.projects(user_id);
create index if not exists idx_projects_is_deleted   on public.projects(is_deleted);
create index if not exists idx_photos_project_id     on public.photos(project_id);
create index if not exists idx_photos_is_deleted     on public.photos(is_deleted);
create index if not exists idx_photos_sort_order     on public.photos(project_id, sort_order);
create index if not exists idx_audit_logs_user_id    on public.audit_logs(user_id);
create index if not exists idx_audit_logs_created_at on public.audit_logs(created_at);

-- =====================================================================
-- 3. updated_at 自動更新トリガー
-- =====================================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_users_updated_at on public.users;
create trigger trg_users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

drop trigger if exists trg_projects_updated_at on public.projects;
create trigger trg_projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

drop trigger if exists trg_photos_updated_at on public.photos;
create trigger trg_photos_updated_at
  before update on public.photos
  for each row execute function public.set_updated_at();

-- =====================================================================
-- 4. サインアップ時に public.users を自動作成
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- 5. 管理者判定ヘルパー
-- =====================================================================
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin' and is_active = true
  );
$$;

-- =====================================================================
-- 6. RLS（行レベルセキュリティ）
-- =====================================================================
alter table public.users      enable row level security;
alter table public.projects   enable row level security;
alter table public.photos     enable row level security;
alter table public.audit_logs enable row level security;

-- ---- users ----
drop policy if exists users_select_self_or_admin on public.users;
create policy users_select_self_or_admin on public.users
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists users_update_self_or_admin on public.users;
create policy users_update_self_or_admin on public.users
  for update using (id = auth.uid() or public.is_admin());

-- ---- projects ----
drop policy if exists projects_select on public.projects;
create policy projects_select on public.projects
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists projects_insert on public.projects;
create policy projects_insert on public.projects
  for insert with check (user_id = auth.uid());

drop policy if exists projects_update on public.projects;
create policy projects_update on public.projects
  for update using (user_id = auth.uid() or public.is_admin());

drop policy if exists projects_delete on public.projects;
create policy projects_delete on public.projects
  for delete using (user_id = auth.uid() or public.is_admin());

-- ---- photos（所属現場の所有者かどうかで判定）----
drop policy if exists photos_select on public.photos;
create policy photos_select on public.photos
  for select using (
    public.is_admin() or exists (
      select 1 from public.projects p
      where p.id = photos.project_id and p.user_id = auth.uid()
    )
  );

drop policy if exists photos_insert on public.photos;
create policy photos_insert on public.photos
  for insert with check (
    exists (
      select 1 from public.projects p
      where p.id = photos.project_id and p.user_id = auth.uid()
    )
  );

drop policy if exists photos_update on public.photos;
create policy photos_update on public.photos
  for update using (
    public.is_admin() or exists (
      select 1 from public.projects p
      where p.id = photos.project_id and p.user_id = auth.uid()
    )
  );

drop policy if exists photos_delete on public.photos;
create policy photos_delete on public.photos
  for delete using (
    public.is_admin() or exists (
      select 1 from public.projects p
      where p.id = photos.project_id and p.user_id = auth.uid()
    )
  );

-- ---- audit_logs（閲覧は管理者のみ。書き込みはサーバー側のservice roleで行う）----
drop policy if exists audit_logs_select_admin on public.audit_logs;
create policy audit_logs_select_admin on public.audit_logs
  for select using (public.is_admin());

-- =====================================================================
-- 7. ストレージ用バケット（写真保存先）
--    ※ Supabase ダッシュボードの Storage で 'photos' バケットを
--      「非公開(Private)」で作成してもOKです。SQLでも作成できます。
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('photos', 'photos', false)
on conflict (id) do nothing;

-- 自分の現場フォルダ（projectId をパス先頭に使う運用）配下のみ読み書き可
-- パス設計: photos/{project_id}/{uuid}.jpg
drop policy if exists storage_photos_all on storage.objects;
create policy storage_photos_all on storage.objects
  for all
  using (
    bucket_id = 'photos' and (
      public.is_admin() or exists (
        select 1 from public.projects p
        where p.user_id = auth.uid()
          and p.id::text = (storage.foldername(name))[1]
      )
    )
  )
  with check (
    bucket_id = 'photos' and exists (
      select 1 from public.projects p
      where p.user_id = auth.uid()
        and p.id::text = (storage.foldername(name))[1]
    )
  );

-- =====================================================================
-- 完了。最初の管理者を作るには、サインアップ後に以下を実行:
--   update public.users set role = 'admin' where email = 'あなたのメール';
-- =====================================================================
