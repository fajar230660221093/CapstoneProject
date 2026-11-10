-- =====================================================================
-- SIM Karang Taruna Dusun Tagog
-- Migrasi 3: Row Level Security, trigger pengaman, bucket Storage
--
-- Prinsip: hak akses ditegakkan di DATABASE, bukan di UI.
-- Tidak ada policy DELETE pada tabel operasional => hard delete mustahil.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Guard: hanya Ketua yang boleh mengubah peran / status aktif akun
-- ---------------------------------------------------------------------
create or replace function public.guard_profile_role_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (new.role is distinct from old.role) or (new.is_active is distinct from old.is_active) then
    if not public.is_chairman() then
      raise exception 'Hanya Ketua yang boleh mengubah peran atau status akun.'
        using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_guard_profile_role_changes
before update on public.profiles
for each row execute function public.guard_profile_role_changes();

-- ---------------------------------------------------------------------
-- Guard: hanya Ketua yang boleh mengarsipkan (soft delete) dokumen
-- ---------------------------------------------------------------------
create or replace function public.guard_document_archive()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    if not public.is_chairman() then
      raise exception 'Hanya Ketua yang boleh mengarsipkan dokumen.'
        using errcode = '42501';
    end if;
    if new.status = 'deleted' then
      new.deleted_at = now();
      new.deleted_by = auth.uid();
    else
      new.deleted_at = null;
      new.deleted_by = null;
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_guard_document_archive
before update on public.documents
for each row execute function public.guard_document_archive();

-- ---------------------------------------------------------------------
-- Guard: hapus bukti tidak boleh menyisakan pengeluaran tanpa nota
-- ---------------------------------------------------------------------
create or replace function public.guard_attachment_removal()
returns trigger
language plpgsql
as $$
declare
  v_kind      public.transaction_kind;
  v_deleted   timestamptz;
  v_remaining integer;
begin
  select kind, deleted_at into v_kind, v_deleted
  from public.cash_transactions where id = old.transaction_id;

  if v_kind = 'expense' and v_deleted is null then
    select count(*) into v_remaining
    from public.transaction_attachments
    where transaction_id = old.transaction_id and id <> old.id;

    if v_remaining = 0 then
      raise exception 'Pengeluaran wajib memiliki minimal satu bukti/nota.'
        using errcode = '23514';
    end if;
  end if;
  return old;
end;
$$;

create trigger trg_guard_attachment_removal
before delete on public.transaction_attachments
for each row execute function public.guard_attachment_removal();

-- ---------------------------------------------------------------------
-- Aktifkan RLS
-- ---------------------------------------------------------------------
alter table public.profiles                 enable row level security;
alter table public.periods                  enable row level security;
alter table public.organization_profiles    enable row level security;
alter table public.document_categories      enable row level security;
alter table public.transaction_categories   enable row level security;
alter table public.documents                enable row level security;
alter table public.document_versions        enable row level security;
alter table public.cash_transactions        enable row level security;
alter table public.transaction_attachments  enable row level security;
alter table public.audit_logs               enable row level security;

-- ---------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------
create policy profiles_select_board
on public.profiles for select to authenticated
using (public.is_board() or id = auth.uid());

create policy profiles_update_chairman
on public.profiles for update to authenticated
using (public.is_chairman())
with check (public.is_chairman());

-- Anggota boleh memperbarui profilnya sendiri (nama & telepon).
-- Perubahan peran/status tetap dijaga trigger trg_guard_profile_role_changes.
create policy profiles_update_self
on public.profiles for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- ---------------------------------------------------------------------
-- periods
-- ---------------------------------------------------------------------
create policy periods_select_board
on public.periods for select to authenticated
using (public.is_board());

create policy periods_insert_chairman
on public.periods for insert to authenticated
with check (public.is_chairman());

create policy periods_update_chairman
on public.periods for update to authenticated
using (public.is_chairman())
with check (public.is_chairman());

-- ---------------------------------------------------------------------
-- organization_profiles (nama organisasi terbaca publik untuk kop & halaman ringkasan)
-- ---------------------------------------------------------------------
create policy org_select_public
on public.organization_profiles for select to anon, authenticated
using (true);

create policy org_update_chairman
on public.organization_profiles for update to authenticated
using (public.is_chairman())
with check (public.is_chairman());

-- ---------------------------------------------------------------------
-- kategori
-- ---------------------------------------------------------------------
create policy doc_categories_select_board
on public.document_categories for select to authenticated
using (public.is_board());

create policy doc_categories_write_chairman
on public.document_categories for insert to authenticated
with check (public.is_chairman());

create policy doc_categories_update_chairman
on public.document_categories for update to authenticated
using (public.is_chairman())
with check (public.is_chairman());

create policy tx_categories_select_board
on public.transaction_categories for select to authenticated
using (public.is_board());

create policy tx_categories_insert_treasurer
on public.transaction_categories for insert to authenticated
with check (public.is_treasurer() or public.is_chairman());

create policy tx_categories_update_treasurer
on public.transaction_categories for update to authenticated
using (public.is_treasurer() or public.is_chairman())
with check (public.is_treasurer() or public.is_chairman());

-- ---------------------------------------------------------------------
-- documents
-- ---------------------------------------------------------------------
create policy documents_select_board
on public.documents for select to authenticated
using (public.is_board());

create policy documents_insert_board
on public.documents for insert to authenticated
with check (public.is_board());

create policy documents_update_chairman_treasurer
on public.documents for update to authenticated
using (public.is_chairman() or public.is_treasurer())
with check (public.is_chairman() or public.is_treasurer());

-- ---------------------------------------------------------------------
-- document_versions (tambahan versi; append-only)
-- ---------------------------------------------------------------------
create policy document_versions_select_board
on public.document_versions for select to authenticated
using (public.is_board());

create policy document_versions_insert_board
on public.document_versions for insert to authenticated
with check (public.is_board());

-- ---------------------------------------------------------------------
-- cash_transactions
-- Ketua & Bendahara boleh BACA. Hanya Bendahara boleh MENULIS.
-- ---------------------------------------------------------------------
create policy transactions_select_chairman_treasurer
on public.cash_transactions for select to authenticated
using (public.is_chairman() or public.is_treasurer());

create policy transactions_insert_treasurer
on public.cash_transactions for insert to authenticated
with check (public.is_treasurer());

create policy transactions_update_treasurer
on public.cash_transactions for update to authenticated
using (public.is_treasurer())
with check (public.is_treasurer());

-- ---------------------------------------------------------------------
-- transaction_attachments
-- ---------------------------------------------------------------------
create policy attachments_select_chairman_treasurer
on public.transaction_attachments for select to authenticated
using (public.is_chairman() or public.is_treasurer());

create policy attachments_insert_treasurer
on public.transaction_attachments for insert to authenticated
with check (public.is_treasurer());

create policy attachments_delete_treasurer
on public.transaction_attachments for delete to authenticated
using (public.is_treasurer());

-- ---------------------------------------------------------------------
-- audit_logs (hanya boleh dibaca; penulisan via trigger)
-- ---------------------------------------------------------------------
create policy audit_logs_select_chairman_treasurer
on public.audit_logs for select to authenticated
using (public.is_chairman() or public.is_treasurer());

-- ---------------------------------------------------------------------
-- Bucket Storage privat
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('documents', 'documents', false, 10485760,
   array['image/jpeg','image/png','image/webp','application/pdf',
         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
         'application/vnd.ms-excel','text/csv',
         'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('receipts', 'receipts', false, 10485760,
   array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do nothing;

-- Dokumen arsip: semua pengurus boleh baca & unggah.
create policy storage_documents_select_board
on storage.objects for select to authenticated
using (bucket_id = 'documents' and public.is_board());

create policy storage_documents_insert_board
on storage.objects for insert to authenticated
with check (bucket_id = 'documents' and public.is_board());

create policy storage_documents_update_board
on storage.objects for update to authenticated
using (bucket_id = 'documents' and public.is_board())
with check (bucket_id = 'documents' and public.is_board());

create policy storage_documents_delete_chairman
on storage.objects for delete to authenticated
using (bucket_id = 'documents' and public.is_chairman());

-- Bukti/nota: hanya Ketua & Bendahara.
create policy storage_receipts_select_chairman_treasurer
on storage.objects for select to authenticated
using (bucket_id = 'receipts' and (public.is_chairman() or public.is_treasurer()));

create policy storage_receipts_insert_treasurer
on storage.objects for insert to authenticated
with check (bucket_id = 'receipts' and public.is_treasurer());

create policy storage_receipts_delete_treasurer
on storage.objects for delete to authenticated
using (bucket_id = 'receipts' and public.is_treasurer());
