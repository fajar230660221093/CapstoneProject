-- =====================================================================
-- SIM Karang Taruna Dusun Tagog
-- Migrasi 7: Konten halaman publik
--
-- organization_profiles sudah boleh dibaca publik dan hanya boleh diubah
-- Ketua. Kolom di bawah dipakai halaman Beranda, Tentang, dan Kontak.
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
