# SIM Karang Taruna Dusun Tagog

Sistem informasi untuk mengelola kegiatan, arsip, dan kas Karang Taruna Dusun
Tagog. Situs publiknya menampilkan agenda serta laporan kas yang dapat dibaca
warga tanpa login, sementara data pribadi dan dokumen internal tetap tertutup.

## Halaman publik

| Rute | Isi |
| --- | --- |
| `/` | Beranda: profil singkat, agenda terdekat, ringkasan kas |
| `/tentang` | Cerita, nilai, visi, dan misi organisasi |
| `/agenda` | Agenda mendatang dan kegiatan yang sudah berlangsung |
| `/transparansi` | Total kas, grafik bulanan, rekap kategori, rincian transaksi |
| `/kontak` | Alamat, telepon/WhatsApp, email, dan media sosial |

Halaman publik selalu terang (tidak mengikuti mode gelap), tidak memakai sidebar
admin, dan tidak menampilkan nama anggota, pencatat, lampiran nota, atau audit
log.

## Aplikasi pengurus

Login di `/masuk`. Menu yang tersedia menyesuaikan peran:

- **Ketua**: dasbor, arsip, kas, rekap, agenda, pengaturan publik, log aktivitas.
- **Bendahara**: dasbor, arsip, kas, rekap, agenda, kategori, impor, log aktivitas.
- **Pengurus**: dasbor, arsip, agenda.

Agenda dikelola di `/kelola/agenda`. Transaksi dapat disembunyikan dari publik
lewat tombol **Tampil di publik** di halaman detail transaksi. Konten Beranda,
Tentang, dan Kontak diatur di `/pengaturan/publik` (khusus Ketua).

## Menjalankan proyek

```bash
npm install
cp .env.example .env.local
npm run dev
```

Isi `.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

`NEXT_PUBLIC_APP_URL` dipakai untuk metadata, sitemap, dan robots. Ganti dengan
URL produksi saat deploy.

## Migrasi database

Migrasi ada di `supabase/migrations`. Terapkan berurutan:

```bash
npx supabase link --project-ref <project-ref>
npx supabase db push
```

Atau jalankan isi migrasi lewat SQL Editor Supabase (urutkan dari `0001` sampai
`0007`). **Halaman publik membutuhkan migrasi `0005`–`0007`**: view
`public_*`, tabel `activities`, dan kolom konten publik.

Untuk sekali jalan tanpa CLI, buka file gabungan
`supabase/setup_public_pages.sql` (isi migrasi `0005`–`0007`), salin seluruh
isinya, lalu tempel ke SQL Editor Supabase.

Setelah migrasi:

- Semua transaksi lama otomatis `is_public = true`.
- Bendahara bisa menyembunyikan transaksi tertentu dari publik tanpa
  mengarsipkannya.
- Agenda yang ditandai publik muncul di `/agenda`; agenda batal tidak tampil.
- View publik hanya membuka kolom aman; tabel asli tetap dilindungi RLS.

## Perintah

```bash
npm run dev          # server pengembangan
npm run build        # build produksi
npm run typecheck    # TypeScript
npm run lint         # ESLint
npm test             # seluruh unit test
npm run test:unit    # unit test saja
npm run db:push      # supabase db push
```

## Tumpukan

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Supabase
(Postgres + Auth + Storage), dan komponen shadcn/ui. Ekspor laporan memakai
ExcelJS dan React PDF.
