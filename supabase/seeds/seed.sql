-- =====================================================================
-- Seed data awal SIM Karang Taruna Dusun Tagog
-- Idempotent: aman dijalankan berkali-kali.
-- =====================================================================

insert into public.document_categories (code, label, sort_order)
values
  ('keuangan',    'Keuangan',    1),
  ('keanggotaan', 'Keanggotaan', 2),
  ('proposal',    'Proposal',    3),
  ('laporan',     'Laporan',     4),
  ('lainnya',     'Lainnya',     5)
on conflict (code) do update
  set label = excluded.label, sort_order = excluded.sort_order;

insert into public.transaction_categories (code, label, kind, sort_order)
values
  ('iuran',      'Iuran',      'income',  1),
  ('donasi',     'Donasi',     'income',  2),
  ('kegiatan',   'Kegiatan',   'both',    3),
  ('operasional', 'Operasional', 'expense', 4),
  ('lainnya',    'Lainnya',    'both',    5)
on conflict (code) do update
  set label = excluded.label, kind = excluded.kind, sort_order = excluded.sort_order;

-- Periode awal kepengurusan. Hanya satu periode boleh berstatus 'active'.
insert into public.periods (name, start_year, end_year, status)
select 'Periode 2025-2026', 2025, 2026, 'active'
where not exists (select 1 from public.periods);

update public.organization_profiles
set org_name = 'Karang Taruna Dusun Tagog',
    dusun_name = 'Dusun Tagog'
where id = 1;
