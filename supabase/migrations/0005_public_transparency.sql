-- =====================================================================
-- SIM Karang Taruna Dusun Tagog
-- Migrasi 5: Data publik untuk halaman transparansi
--
-- Prinsip:
--  - Tabel asli TETAP tertutup untuk anon.
--  - Hanya view dengan kolom terbatas yang dibuka ke publik.
--  - Kolom sensitif (created_by, member_id, lampiran, audit) tidak pernah
--    ikut terekspos.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Tombol pengaman: transaksi bisa disembunyikan dari halaman publik
-- tanpa menghapus atau mengarsipkannya.
-- ---------------------------------------------------------------------
alter table public.cash_transactions
  add column if not exists is_public boolean not null default true;

create index if not exists idx_tx_public_period_date
  on public.cash_transactions (period_id, transaction_date desc)
  where deleted_at is null and is_public = true;

-- ---------------------------------------------------------------------
-- Periode yang boleh tampil di publik
-- ---------------------------------------------------------------------
create or replace view public.public_periods
with (security_barrier = true) as
select
  p.id,
  p.name,
  p.start_year,
  p.end_year,
  p.status
from public.periods p;

-- ---------------------------------------------------------------------
-- Total kas per periode (hanya transaksi publik & belum diarsipkan)
-- ---------------------------------------------------------------------
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

-- ---------------------------------------------------------------------
-- Rincian transaksi publik
-- ---------------------------------------------------------------------
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

-- ---------------------------------------------------------------------
-- Kategori transaksi publik (untuk filter laporan)
-- ---------------------------------------------------------------------
create or replace view public.public_transaction_categories
with (security_barrier = true) as
select
  c.id,
  c.code,
  c.label,
  c.kind
from public.transaction_categories c
where c.is_active = true;

-- ---------------------------------------------------------------------
-- Hak akses: hanya SELECT, hanya pada view publik.
-- Tabel asli tetap dilindungi RLS dan tidak diberi grant ke anon.
-- ---------------------------------------------------------------------
grant select on public.public_periods to anon, authenticated;
grant select on public.public_period_balances to anon, authenticated;
grant select on public.public_transactions to anon, authenticated;
grant select on public.public_transaction_categories to anon, authenticated;

comment on view public.public_transactions is
  'Data transaksi yang aman ditampilkan ke publik. Tidak memuat identitas pencatat, anggota, atau lampiran.';
comment on view public.public_period_balances is
  'Total kas publik per periode, dihitung hanya dari transaksi yang is_public = true.';
