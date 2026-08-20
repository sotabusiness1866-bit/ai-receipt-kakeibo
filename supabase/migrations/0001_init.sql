-- AIレシート家計簿 MVP 初期スキーマ
-- Supabase SQL Editorで実行してください。

-- =========================================
-- 1. categories（固定カテゴリ、MVPでは読み取り専用）
-- =========================================
create table if not exists public.categories (
  id smallint primary key generated always as identity,
  slug text not null unique,
  label text not null,
  color text not null,
  sort_order smallint not null,
  created_at timestamptz not null default now()
);

insert into public.categories (slug, label, color, sort_order) values
  ('food', '食費', '#F59E0B', 1),
  ('daily', '日用品', '#10B981', 2),
  ('transport', '交通費', '#3B82F6', 3),
  ('entertainment', '娯楽', '#8B5CF6', 4),
  ('medical', '医療', '#EF4444', 5),
  ('clothing', '衣服・美容', '#EC4899', 6),
  ('housing', '住居', '#6366F1', 7),
  ('utility', '水道・光熱費', '#14B8A6', 8),
  ('communication', '通信費', '#F97316', 9),
  ('other', 'その他', '#9CA3AF', 10)
on conflict (slug) do nothing;

-- =========================================
-- 2. receipts
-- =========================================
create table if not exists public.receipts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  store_name text,
  purchase_date date,
  total_amount numeric(12, 2) not null default 0,
  category_id smallint not null references public.categories(id),
  memo text,
  image_path text not null,
  ai_raw_response jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists receipts_user_id_purchase_date_idx
  on public.receipts (user_id, purchase_date desc);

-- =========================================
-- 3. Row Level Security
-- =========================================
alter table public.receipts enable row level security;
alter table public.categories enable row level security;

drop policy if exists "receipts_select_own" on public.receipts;
create policy "receipts_select_own" on public.receipts
  for select using (auth.uid() = user_id);

drop policy if exists "receipts_insert_own" on public.receipts;
create policy "receipts_insert_own" on public.receipts
  for insert with check (auth.uid() = user_id);

drop policy if exists "receipts_update_own" on public.receipts;
create policy "receipts_update_own" on public.receipts
  for update using (auth.uid() = user_id);

drop policy if exists "receipts_delete_own" on public.receipts;
create policy "receipts_delete_own" on public.receipts
  for delete using (auth.uid() = user_id);

drop policy if exists "categories_select_authenticated" on public.categories;
create policy "categories_select_authenticated" on public.categories
  for select using (auth.role() = 'authenticated');

-- =========================================
-- 4. Storage: receiptsバケット（非公開）
-- =========================================
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false)
on conflict (id) do nothing;

drop policy if exists "receipts_storage_insert_own" on storage.objects;
create policy "receipts_storage_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "receipts_storage_select_own" on storage.objects;
create policy "receipts_storage_select_own" on storage.objects
  for select using (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "receipts_storage_delete_own" on storage.objects;
create policy "receipts_storage_delete_own" on storage.objects
  for delete using (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
