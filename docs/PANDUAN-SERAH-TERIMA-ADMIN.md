# Panduan Serah Terima Admin - SIM Karang Taruna Dusun Tagog

Dokumen ini berisi informasi yang wajib diserahkan saat perpindahan pengurus/admin aplikasi.

## 1. Akses yang Perlu Dikelola

| Akses | Lokasi | Keterangan |
|---|---|---|
| Akun pengurus aplikasi | Halaman **Profil** (di aplikasi) | Ketua dapat mengubah peran, mengaktifkan/nonaktifkan anggota. |
| Project Supabase | [supabase.com](https://supabase.com) | Akses pemilik (owner) project utama. |
| Project Supabase (cadangan) | [supabase.com](https://supabase.com) | Project kedua untuk penyimpanan backup. |
| Repository (opsional) | GitHub/GitLab | Berisi kode, migrasi SQL, dan workflow. |
| Vercel | [vercel.com](https://vercel.com) | Deploy aplikasi produksi. |

## 2. Daftar Berkas Penting

| Berkas | Kegunaan |
|---|---|
| `supabase/migrations/*.sql` | Skema database, RLS, trigger, fungsi, dan storage policy. **Jangan diubah** kecuali sudah dipahami. |
| `supabase/seeds/seed.sql` | Data awal kategori dan periode. |
| `.env.example` | Daftar variabel lingkungan yang dibutuhkan. |
| `.github/workflows/backup.yml` | Backup harian ke project cadangan. |
| `.github/workflows/test.yml` | CI (typecheck, lint, test, build). |
| `scripts/backup-db.sh` | Skrip backup yang dipakai workflow. |
| `docs/` | Panduan pengguna, backup & pemulihan, serah terima. |

## 3. Migrasi Database

Saat men-deploy perubahan skema:

```bash
# Login & link project (hanya pertama kali)
npx supabase link --project-ref <PROJECT_REF>

# Terapkan migrasi ke project Supabase hosted
npx supabase db push
```

Jalankan migrasi **hanya oleh orang yang paham** konsekuensinya. Skema dilengkapi **RLS** dan **trigger pengaman**.

## 4. Manajemen Pengguna

1. Tambahkan pengguna baru via **Supabase Dashboard** → **Authentication** → **Users**.
2. Saat pengguna pertama kali login, profil otomatis dibuat dengan peran **Pengurus**.
3. **Ketua** menaikkan peran (Bendahara/Pengurus) lewat aplikasi di **Profil → Daftar Anggota**.
4. Nonaktifkan akun lewat aplikasi bila anggota sudah tidak aktif.

## 5. Periode Kepengurusan

- Hanya **satu** periode yang boleh berstatus **Aktif**.
- Saat pergantian kepengurusan, **Ketua** bisa membuat periode baru (periode lama otomatis/ bisa diarsipkan).
- Semua transaksi dan arsip terikat pada periode terpilih.

## 6. Backup & Pemulihan

Lihat **[Panduan Backup dan Pemulihan](PANDUAN-BACKUP-DAN-PEMULIHAN.md)** untuk detail lengkap:

- **Backup harian** otomatis via GitHub Actions (00:00 WIB).
- Cadangan disimpan di **project Supabase kedua** (bucket `backups`).
- Simpan juga **Service Role Key** cadangan di tempat yang aman (terpisah dari akses aplikasi).

## 7. Checklist Serah Terima

- [ ] Serahkan akses **Supabase** (owner/editor sesuai kebutuhan) + daftar akun.
- [ ] Serahkan akses **Vercel** project produksi.
- [ ] Serahkan **GitHub Secrets** yang aktif (daftar nama secret, bukan nilainya ke grup publik).
- [ ] Pastikan **backup harian** berhasil minimal 1x (cek Actions log).
- [ ] Pastikan ada minimal **1 pengguna Ketua** yang masih aktif.
- [ ] Serahkan seluruh dokumen di folder `docs/`.
- [ ] Catat **tanggal serah terima** dan nama yang menerima.

## 8. Kontak Darurat

Catat kontak teknis yang bisa dihubungi bila ada masalah kritis (akses, backup, atau error saat login).

**Catatan:** Jangan bagikan **service role key** ke luar jalur resmi. Kunci ini melewati seluruh proteksi RLS.
