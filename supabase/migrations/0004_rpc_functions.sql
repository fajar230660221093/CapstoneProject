-- =====================================================================
-- SIM Karang Taruna Dusun Tagog
-- Migrasi 4: Fungsi RPC untuk transaksi kas
--
-- Mengapa perlu RPC?
-- Aturan "pengeluaran wajib ada nota" diperiksa oleh constraint trigger
-- yang DEFERRED (dijalankan saat COMMIT). PostgREST (API yang dipakai
-- supabase-js) membuka SATU transaksi database per HTTP request, jadi
-- INSERT transaksi dan INSERT lampiran lewat dua request terpisah akan
-- ditolak: trigger baru berjalan sebelum lampiran ada.
--
-- Solusinya: satu fungsi Postgres yang membuat transaksi + lampirannya
-- dalam satu transaksi database. Fungsi memakai SECURITY INVOKER, sehingga
-- aturan RLS tetap berlaku untuk pengguna yang memanggilnya.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Buat transaksi kas (beserta lampiran bukti bila ada)
-- ---------------------------------------------------------------------
create or replace function public.create_cash_transaction(
  p_period_id        uuid,
  p_transaction_date date,
  p_kind             public.transaction_kind,
  p_amount           bigint,
  p_category_id      uuid,
  p_description      text,
  p_source           public.transaction_source default 'manual',
  p_attachments      jsonb default '[]'::jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_transaction_id uuid;
  v_attachment     jsonb;
begin
  insert into public.cash_transactions (
    period_id, transaction_date, kind, amount,
    category_id, description, source, created_by
  )
  values (
    p_period_id, p_transaction_date, p_kind, p_amount,
    p_category_id, p_description, p_source, auth.uid()
  )
  returning id into v_transaction_id;

  for v_attachment in
    select * from jsonb_array_elements(coalesce(p_attachments, '[]'::jsonb))
  loop
    insert into public.transaction_attachments (
      transaction_id, storage_path, file_name, file_size, mime_type, uploaded_by
    )
    values (
      v_transaction_id,
      v_attachment ->> 'storage_path',
      v_attachment ->> 'file_name',
      nullif(v_attachment ->> 'file_size', '')::integer,
      v_attachment ->> 'mime_type',
      auth.uid()
    );
  end loop;

  return v_transaction_id;
end;
$$;

-- ---------------------------------------------------------------------
-- Ubah transaksi kas (tanpa lampiran; lampiran dikelola terpisah)
-- ---------------------------------------------------------------------
create or replace function public.update_cash_transaction(
  p_transaction_id   uuid,
  p_transaction_date date,
  p_kind             public.transaction_kind,
  p_amount           bigint,
  p_category_id      uuid,
  p_description      text
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  update public.cash_transactions
  set transaction_date = p_transaction_date,
      kind             = p_kind,
      amount           = p_amount,
      category_id      = p_category_id,
      description      = p_description
  where id = p_transaction_id
    and deleted_at is null;
end;
$$;

-- ---------------------------------------------------------------------
-- Impor banyak transaksi sekaligus (dipakai modul impor kas lama)
-- Setiap baris: { transaction_date, kind, amount, category_code,
--                 description, member_name, has_receipt }
-- ---------------------------------------------------------------------
create or replace function public.import_cash_transactions(
  p_period_id uuid,
  p_rows      jsonb
)
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_row        jsonb;
  v_count      integer := 0;
  v_category   uuid;
begin
  for v_row in select * from jsonb_array_elements(coalesce(p_rows, '[]'::jsonb))
  loop
    select id into v_category
    from public.transaction_categories
    where code = v_row ->> 'category_code' and is_active = true
    limit 1;

    insert into public.cash_transactions (
      period_id, transaction_date, kind, amount,
      category_id, description, source, created_by
    )
    values (
      p_period_id,
      (v_row ->> 'transaction_date')::date,
      (v_row ->> 'kind')::public.transaction_kind,
      (v_row ->> 'amount')::bigint,
      v_category,
      v_row ->> 'description',
      'import',
      auth.uid()
    );

    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

grant execute on function public.create_cash_transaction(uuid, date, public.transaction_kind, bigint, uuid, text, public.transaction_source, jsonb) to authenticated;
grant execute on function public.update_cash_transaction(uuid, date, public.transaction_kind, bigint, uuid, text) to authenticated;
grant execute on function public.import_cash_transactions(uuid, jsonb) to authenticated;

-- ---------------------------------------------------------------------
-- Buat dokumen arsip beserta versi pertamanya (satu transaksi database)
-- p_versions: array of { storage_path, file_name, file_size, mime_type, note }
-- ---------------------------------------------------------------------
create or replace function public.create_document_with_version(
  p_period_id   uuid,
  p_title       text,
  p_description text,
  p_category_id uuid,
  p_year        integer,
  p_versions    jsonb default '[]'::jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_document_id uuid;
  v_version     jsonb;
  v_index       integer := 1;
begin
  insert into public.documents (
    period_id, title, description, category_id, year, uploaded_by, current_version
  )
  values (
    p_period_id, p_title, p_description, p_category_id, p_year, auth.uid(),
    case when coalesce(jsonb_array_length(p_versions), 0) > 0 then 1 else 0 end
  )
  returning id into v_document_id;

  for v_version in
    select * from jsonb_array_elements(coalesce(p_versions, '[]'::jsonb))
  loop
    insert into public.document_versions (
      document_id, version_no, storage_path, file_name, file_size, mime_type, note, uploaded_by
    )
    values (
      v_document_id,
      v_index,
      v_version ->> 'storage_path',
      v_version ->> 'file_name',
      nullif(v_version ->> 'file_size', '')::integer,
      v_version ->> 'mime_type',
      v_version ->> 'note',
      auth.uid()
    );
    v_index := v_index + 1;
  end loop;

  return v_document_id;
end;
$$;

grant execute on function public.create_document_with_version(uuid, text, text, uuid, integer, jsonb) to authenticated;

