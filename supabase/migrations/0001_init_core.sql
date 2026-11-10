-- =====================================================================
-- SIM Karang Taruna Dusun Tagog
-- Migrasi 1: Fondasi (ekstensi, enum, fungsi peran, periode, arsip)
-- =====================================================================

create extension if not exists pgcrypto;
create extension if not exists pg_trgm with schema extensions;

-- ---------------------------------------------------------------------
-- Enum
-- ---------------------------------------------------------------------
create type public.app_role as enum ('chairman', 'treasurer', 'manager');
create type public.period_status as enum ('active', 'archived');
create type public.document_status as enum ('active', 'deleted');
create type public.transaction_kind as enum ('income', 'expense');
create type public.transaction_source as enum ('manual', 'dues', 'import', 'opening_balance');
create type public.category_kind as enum ('income', 'expense', 'both');

-- ---------------------------------------------------------------------
-- updated_at otomatis
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- Tabel inti
-- ---------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null default '',
  role        public.app_role not null default 'manager',
  phone       text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_profiles_role on public.profiles (role);

create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Fungsi helper peran
-- SECURITY DEFINER + search_path terkunci agar tidak memicu RLS rekursif.
-- Diletakkan SETELAH tabel profiles dibuat: fungsi bahasa SQL divalidasi
-- saat CREATE, jadi tabel rujukannya harus sudah ada lebih dulu.
-- ---------------------------------------------------------------------
create or replace function public.current_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid() and is_active = true;
$$;

create or replace function public.is_chairman()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role() = 'chairman';
$$;

create or replace function public.is_treasurer()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role() = 'treasurer';
$$;

create or replace function public.is_board()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role() is not null;
$$;

-- Profil otomatis dibuat saat akun dibuat (peran default 'manager';
-- hanya Ketua yang boleh menaikkan peran lewat aplikasi).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(coalesce(new.email, ''), '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger trg_on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create table public.periods (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  start_year  integer not null,
  end_year    integer not null,
  status      public.period_status not null default 'active',
  dues_amount bigint check (dues_amount is null or dues_amount >= 0),
  closed_at   timestamptz,
  closed_by   uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint periods_year_range check (end_year >= start_year)
);

-- Hanya boleh ada SATU periode aktif.
create unique index periods_single_active
on public.periods ((status)) where status = 'active';

create index idx_periods_years on public.periods (start_year desc);

create trigger trg_periods_updated_at
before update on public.periods
for each row execute function public.set_updated_at();

create table public.organization_profiles (
  id          smallint primary key default 1 check (id = 1),
  org_name    text not null default 'Karang Taruna Dusun Tagog',
  dusun_name  text not null default 'Dusun Tagog',
  address     text,
  logo_path   text,
  updated_at  timestamptz not null default now()
);

insert into public.organization_profiles (id) values (1);

create table public.document_categories (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  label       text not null,
  is_active   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create table public.transaction_categories (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  label       text not null,
  kind        public.category_kind not null default 'both',
  is_active   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger trg_transaction_categories_updated_at
before update on public.transaction_categories
for each row execute function public.set_updated_at();

create table public.documents (
  id               uuid primary key default gen_random_uuid(),
  period_id        uuid not null references public.periods (id) on delete restrict,
  title            text not null check (char_length(trim(title)) > 0),
  description      text,
  category_id      uuid references public.document_categories (id) on delete set null,
  year             integer not null,
  uploaded_by      uuid not null references public.profiles (id) on delete restrict,
  current_version  integer not null default 1 check (current_version >= 1),
  status           public.document_status not null default 'active',
  deleted_at       timestamptz,
  deleted_by       uuid references public.profiles (id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index idx_documents_period_status on public.documents (period_id, status);
create index idx_documents_year on public.documents (year);
create index idx_documents_category on public.documents (category_id);
create index idx_documents_uploader on public.documents (uploaded_by);
create index idx_documents_created_at on public.documents (created_at desc);
create index idx_documents_title_trgm on public.documents using gin (title extensions.gin_trgm_ops);

create trigger trg_documents_updated_at
before update on public.documents
for each row execute function public.set_updated_at();

create table public.document_versions (
  id           uuid primary key default gen_random_uuid(),
  document_id  uuid not null references public.documents (id) on delete cascade,
  version_no   integer not null check (version_no >= 1),
  storage_path text not null,
  file_name    text not null,
  file_size    integer check (file_size is null or file_size >= 0),
  mime_type    text,
  note         text,
  uploaded_by  uuid references public.profiles (id) on delete set null,
  uploaded_at  timestamptz not null default now(),
  unique (document_id, version_no)
);

create index idx_document_versions_document on public.document_versions (document_id, version_no desc);
