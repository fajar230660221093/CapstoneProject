-- =====================================================================
-- SIM Karang Taruna Dusun Tagog
-- Migrasi 2: Transaksi kas, lampiran bukti, log aktivitas (audit)
-- =====================================================================

create table public.cash_transactions (
  id                uuid primary key default gen_random_uuid(),
  period_id         uuid not null references public.periods (id) on delete restrict,
  transaction_date  date not null,
  kind              public.transaction_kind not null,
  amount            bigint not null check (amount > 0),
  category_id       uuid references public.transaction_categories (id) on delete set null,
  member_id         uuid,
  description       text,
  source            public.transaction_source not null default 'manual',
  created_by        uuid not null references public.profiles (id) on delete restrict,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  deleted_at        timestamptz,
  deleted_by        uuid references public.profiles (id) on delete set null
);

create index idx_tx_period_date on public.cash_transactions (period_id, transaction_date desc);
create index idx_tx_kind_date on public.cash_transactions (kind, transaction_date desc);
create index idx_tx_category on public.cash_transactions (category_id);
create index idx_tx_member on public.cash_transactions (member_id);
create index idx_tx_amount on public.cash_transactions (amount);
create index idx_tx_description_trgm
  on public.cash_transactions using gin (description extensions.gin_trgm_ops);
create index idx_tx_active
  on public.cash_transactions (period_id, transaction_date desc) where deleted_at is null;

create trigger trg_cash_transactions_updated_at
before update on public.cash_transactions
for each row execute function public.set_updated_at();

create table public.transaction_attachments (
  id             uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.cash_transactions (id) on delete cascade,
  storage_path   text not null,
  file_name      text not null,
  file_size      integer check (file_size is null or file_size >= 0),
  mime_type      text,
  uploaded_by    uuid references public.profiles (id) on delete set null,
  created_at     timestamptz not null default now()
);

create index idx_transaction_attachments_tx on public.transaction_attachments (transaction_id);

-- ---------------------------------------------------------------------
-- Log aktivitas (append-only, ditulis trigger saja)
-- ---------------------------------------------------------------------
create table public.audit_logs (
  id          bigint generated always as identity primary key,
  table_name  text not null,
  record_id   uuid not null,
  action      text not null check (action in ('insert', 'update', 'delete', 'restore')),
  actor_id    uuid,
  actor_role  text,
  old_data    jsonb,
  new_data    jsonb,
  created_at  timestamptz not null default now()
);

create index idx_audit_table_time on public.audit_logs (table_name, created_at desc);
create index idx_audit_record on public.audit_logs (record_id);

create or replace function public.log_cash_transaction_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_logs (table_name, record_id, action, actor_id, actor_role, old_data, new_data)
  values (
    'cash_transactions',
    coalesce(new.id, old.id),
    case when tg_op = 'INSERT' then 'insert'
         when tg_op = 'UPDATE' then
           case when old.deleted_at is null and new.deleted_at is not null then 'delete'
                when old.deleted_at is not null and new.deleted_at is null then 'restore'
                else 'update' end
         else 'delete' end,
    auth.uid(),
    public.current_role()::text,
    case when tg_op = 'INSERT' then null else to_jsonb(old) end,
    case when tg_op = 'DELETE' then null else to_jsonb(new) end
  );
  return coalesce(new, old);
end;
$$;

create trigger trg_audit_cash_transactions
after insert or update or delete on public.cash_transactions
for each row execute function public.log_cash_transaction_changes();

-- ---------------------------------------------------------------------
-- Aturan: pengeluaran WAJIB memiliki minimal satu bukti/nota.
-- Constraint trigger DEFERRABLE => diperiksa saat COMMIT, sehingga
-- transaksi + lampiran bisa dibuat dalam satu transaksi database.
--
-- Pengecualian: transaksi dengan source = 'import' (data kas lama yang
-- dimuat dari berkas Excel/CSV) tidak wajib menyertakan bukti, karena
-- nota fisiknya sudah ada di arsip lama. Transaksi impor ditandai
-- "perlu verifikasi" di aplikasi.
-- ---------------------------------------------------------------------
create or replace function public.assert_expense_has_receipt()
returns trigger
language plpgsql
as $$
begin
  if new.kind = 'expense'
     and new.deleted_at is null
     and new.source = 'manual' then
    if not exists (
      select 1 from public.transaction_attachments a where a.transaction_id = new.id
    ) then
      raise exception 'Pengeluaran wajib melampirkan minimal satu bukti/nota.'
        using errcode = '23514';
    end if;
  end if;
  return new;
end;
$$;

create constraint trigger trg_expense_requires_receipt
after insert or update on public.cash_transactions
deferrable initially deferred
for each row execute function public.assert_expense_has_receipt();

-- ---------------------------------------------------------------------
-- View bantu: saldo per periode (hanya transaksi yang belum dihapus)
-- ---------------------------------------------------------------------
create or replace view public.period_balances
with (security_invoker = true) as
select
  p.id as period_id,
  p.name as period_name,
  coalesce(sum(t.amount) filter (where t.kind = 'income'), 0)::bigint as total_income,
  coalesce(sum(t.amount) filter (where t.kind = 'expense'), 0)::bigint as total_expense,
  coalesce(sum(case when t.kind = 'income' then t.amount else -t.amount end), 0)::bigint as balance
from public.periods p
left join public.cash_transactions t
  on t.period_id = p.id and t.deleted_at is null
group by p.id, p.name;
