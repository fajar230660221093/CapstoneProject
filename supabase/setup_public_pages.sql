-- =====================================================================
-- SIM Karang Taruna Dusun Tagog
-- SETUP DATABASE: HALAMAN PUBLIK & AGENDA
--
-- File ini berisi migrasi 0005 + 0006 + 0007.
-- Jalankan SEKALI di Supabase Dashboard -> SQL Editor.
--
-- Aman dijalankan ulang: view, grant, policy, dan trigger akan dibuat
-- ulang. Jangan jalankan file ini bersamaan dengan `supabase db push`
-- untuk migrasi 0005-0007.
-- =====================================================================

begin;

-- =====================================================================
-- 0005: Data publik untuk halaman transparansi
-- =====================================================================

-- Tombol pengaman: transaksi bisa disembunyikan dari halaman publik
-- tanpa menghapus atau mengarsipkannya.
alter table public.cash_transactions
  add column if not exists is_public boolean not null default true;

create index if not exists idx_tx_public_period_date
  on public.cash_transactions (period_id, transaction_date desc)
  where deleted_at is null and is_public = true;

-- Periode yang boleh tampil di publik
create or replace view public.public_periods
with (security_barrier = true) as
select
  p.id,
  p.name,
  p.start_year,
  p.end_year,
  p.status
from public.periods p;

-- Total kas per periode (hanya transaksi publik & belum diarsipkan)
create or replace view public.public_period_balances
with (security_barrier = true) as
select
  p.id as period_id,
  p.name as period_name,
  coalesce(sum(t.amount) filter (where t.kind = 'income'), 0)::bigint as total_income,
  coalesce(sum(t.amount) filter (where t.kind = 'expense'), 0)::bigint as total_expense,
  coalesce(
    sum(case when t.kind = 'income' then t.amount else -t.amount end),
    0
  )::bigint as balance
from public.periods p
left join public.cash_transactions t
  on t.period_id = p.id
 and t.deleted_at is null
 and t.is_public = true
group by p.id, p.name;

-- Rincian transaksi publik
create or replace view public.public_transactions
with (security_barrier = true) as
select
  t.id,
  t.period_id,
  t.transaction_date,
  t.kind,
  t.amount,
  t.description,
  c.code as category_code,
  c.label as category_label
from public.cash_transactions t
left join public.transaction_categories c on c.id = t.category_id
where t.deleted_at is null
  and t.is_public = true;

-- Kategori transaksi publik (untuk filter laporan)
create or replace view public.public_transaction_categories
with (security_barrier = true) as
select
  c.id,
  c.code,
  c.label,
  c.kind
from public.transaction_categories c
where c.is_active = true;

-- Hak akses: hanya SELECT, hanya pada view publik.
-- Tabel asli tetap dilindungi RLS dan tidak diberi grant ke anon.
grant select on public.public_periods to anon, authenticated;
grant select on public.public_period_balances to anon, authenticated;
grant select on public.public_transactions to anon, authenticated;
grant select on public.public_transaction_categories to anon, authenticated;

comment on view public.public_transactions is
  'Data transaksi yang aman ditampilkan ke publik. Tidak memuat identitas pencatat, anggota, atau lampiran.';
comment on view public.public_period_balances is
  'Total kas publik per periode, dihitung hanya dari transaksi yang is_public = true.';

-- =====================================================================
-- 0006: Agenda kegiatan
-- =====================================================================

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typname = 'activity_status'
  ) then
    create type public.activity_status as enum (
      'planned',
      'ongoing',
      'done',
      'cancelled'
    );
  end if;
end
$$;

create table if not exists public.activities (
  id          uuid primary key default gen_random_uuid(),
  title       text not null check (char_length(trim(title)) > 0),
  description text,
  location    text,
  starts_at   timestamptz not null,
  ends_at     timestamptz,
  status      public.activity_status not null default 'planned',
  is_public   boolean not null default true,
  created_by  uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint activities_time_range check (ends_at is null or ends_at >= starts_at)
);

create index if not exists idx_activities_starts_at
  on public.activities (starts_at desc);

create index if not exists idx_activities_public_starts
  on public.activities (starts_at)
  where is_public = true and status <> 'cancelled';

drop trigger if exists trg_activities_updated_at on public.activities;

create trigger trg_activities_updated_at
before update on public.activities
for each row execute function public.set_updated_at();

alter table public.activities enable row level security;

-- Pengurus boleh membaca seluruh agenda (termasuk yang belum publik).
drop policy if exists activities_select_board on public.activities;
create policy activities_select_board
on public.activities for select to authenticated
using (public.is_board());

-- Pengurus boleh membuat agenda.
drop policy if exists activities_insert_board on public.activities;
create policy activities_insert_board
on public.activities for insert to authenticated
with check (public.is_board());

-- Pengurus boleh mengubah agenda. Tidak ada policy DELETE.
drop policy if exists activities_update_board on public.activities;
create policy activities_update_board
on public.activities for update to authenticated
using (public.is_board())
with check (public.is_board());

-- View publik: hanya agenda yang ditandai publik dan tidak dibatalkan.
create or replace view public.public_activities
with (security_barrier = true) as
select
  a.id,
  a.title,
  a.description,
  a.location,
  a.starts_at,
  a.ends_at,
  a.status
from public.activities a
where a.is_public = true
  and a.status <> 'cancelled';

grant select on public.public_activities to anon, authenticated;

comment on view public.public_activities is
  'Agenda kegiatan yang aman ditampilkan ke publik. Tidak memuat identitas pembuat.';

-- =====================================================================
-- 0007: Konten halaman publik
-- =====================================================================

alter table public.organization_profiles
  add column if not exists tagline        text,
  add column if not exists about_text     text,
  add column if not exists vision         text,
  add column if not exists mission        text,
  add column if not exists contact_phone  text,
  add column if not exists contact_email  text,
  add column if not exists instagram_url  text,
  add column if not exists facebook_url   text,
  add column if not exists maps_url       text;

-- Isi awal yang wajar. Nilai yang sudah diisi pengurus tidak ditimpa.
update public.organization_profiles
set
  tagline = coalesce(
    tagline,
    'Bersama membangun dusun, terbuka dalam mengelola.'
  ),
  about_text = coalesce(
    about_text,
    'Karang Taruna Dusun Tagog adalah wadah kepemudaan yang tumbuh dari semangat gotong royong warga. Kami bergerak di bidang sosial, budaya, olahraga, dan pemberdayaan pemuda, sekaligus menjaga agar pengelolaan kegiatan dan keuangan organisasi dapat diikuti oleh siapa saja.'
  ),
  vision = coalesce(
    vision,
    'Menjadi organisasi kepemudaan yang aktif, kolaboratif, dan terbuka, serta ikut membangun Dusun Tagog yang maju dan rukun.'
  ),
  mission = coalesce(
    mission,
    E'Mendorong partisipasi pemuda dalam kegiatan sosial dan kemasyarakatan.\nMengelola kegiatan organisasi secara rapi, terencana, dan dapat dipertanggungjawabkan.\nMenjaga keterbukaan informasi, termasuk laporan keuangan, kepada warga.\nMempererat kebersamaan antarwarga melalui kegiatan budaya, olahraga, dan pendidikan.'
  ),
  updated_at = now()
where id = 1;

comment on column public.organization_profiles.tagline is
  'Kalimat singkat untuk hero halaman publik.';
comment on column public.organization_profiles.about_text is
  'Cerita singkat organisasi untuk halaman Tentang.';
comment on column public.organization_profiles.mission is
  'Poin misi, satu poin per baris.';

commit;

-- Segarkan cache schema PostgREST Supabase.
notify pgrst, 'reload schema';
