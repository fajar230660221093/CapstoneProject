# Panduan Backup dan Pemulihan - SIM Karang Taruna Dusun Tagog

Dokumen ini menjelaskan cara kerja cadangan data, cara memeriksa, dan cara memulihkan bila terjadi kendala.

## 1. Prinsip Backup

- **Tidak bergantung pada 1 project**: cadangan dikirim ke **project Supabase kedua** (gratis) yang berbeda dari project aplikasi.
- **Otomatis harian**: GitHub Actions menjalankan `pg_dump` setiap **00:00 WIB**.
- **Bisa dipicu manual**: melalui tab **Actions** → **Backup Database Harian** → **Run workflow**.
- **Bisa diunduh**: file `.sql.gz` tersedia di **Storage** bucket `backups` pada project cadangan.

## 2. Rahasia yang Diperlukan (GitHub Secrets)

Buat secret berikut di repository: **Settings → Secrets and variables → Actions**.

| Secret | Sumber | Keterangan |
|---|---|---|
| `SUPABASE_DB_HOST` | Supabase → Settings → Database (Connection string / Pooler) | Host untuk `pg_dump` (bisa pakai pooler). |
| `SUPABASE_DB_PORT` | Sama seperti di atas | Biasanya `6543` untuk pooler. |
| `SUPABASE_DB_NAME` | Biasanya `postgres` | Nama database. |
| `SUPABASE_DB_PASSWORD` | Password database project utama | **Rahasia**. |
| `BACKUP_SUPABASE_URL` | Project cadangan → Settings → API | `https://xxxx.supabase.co` |
| `BACKUP_SUPABASE_SERVICE_ROLE_KEY` | Project cadangan → Settings → API → Service Role | **Hanya untuk workflow**. Jangan dipakai di aplikasi. |
| `BACKUP_BUCKET_NAME` | Nama bucket cadangan | Default: `backups` (buat bucket ini di project cadangan). |

## 3. Menyiapkan Project Cadangan

1. Buat **project Supabase baru** (terpisah dari project aplikasi).
2. Buka **Storage** → buat bucket **`backups`** (privat, tidak perlu public).
3. Simpan **URL** dan **Service Role Key** di GitHub Secrets.
4. Pastikan project cadangan dalam kondisi aktif.

## 4. Memeriksa Backup Berjalan

1. Buka repository → **Actions** → **Backup Database Harian**.
2. Periksa run terakhir: status **berhasil** (hijau).
3. Buka project cadangan → **Storage** → **backups**. Harus ada file `sim-tagog-backup-YYYY-MM-DD_HH-MM-SS.sql.gz` terbaru.
4. Cek ukuran file (jika tiba-tiba 0 KB, perlu investigasi).

## 5. Memulihkan Backup

> **Peringatan:** Pemulihan akan mengganti data di project target. **Hanya** lakukan di project **dev** atau saat benar-benar darurat. Jangan mengembalikan backup ke project produksi sembarangan.

### Cara A: Menggunakan `psql`

```bash
# Unduh file backup lalu ekstrak
gunzip -c sim-tagog-backup-YYYY-MM-DD_HH-MM-SS.sql.gz > backup.sql

# Pulihkan ke project target (pakai connection string/pooler)
PGPASSWORD="<PASSWORD>" psql \
  --host="<HOST>" \
  --port="<PORT>" \
  --username="postgres" \
  --dbname="postgres" \
  -f backup.sql
```

### Cara B: Menggunakan Supabase CLI / Alat Lain

Bisa juga menggunakan `pg_restore` tergantung format dump. Skrip di atas menghasilkan `pg_dump` plain SQL terkompres, jadi **`psql`** adalah cara termudah.

## 6. Peringatan Risiko

- **Project Free bisa di-pause** jika tidak ada aktivitas dalam jangka waktu tertentu (sesuai kebijakan Supabase). Workflow ping `/api/health` bisa membantu mengurangi risiko, namun tidak menjamin 100%.
- **Tanpa backup otomatis** = risiko kehilangan data. Kedua mekanisme (backup harian + ping) sudah disiapkan di repositori.
- **Service Role Key** memiliki hak penuh. Simpan terpisah dari `.env.local` dan jangan commit.

## 7. Troubleshooting

| Masalah | Penyebab | Solusi |
|tag|---|---|
| `pg_dump: connection refused` | Host/Port salah atau IP diblokir | Pastikan pakai pooler atau periksa pengaturan Database. |
| `permission denied` | Password salah / user tidak berhak | Gunakan password database project utama. |
| `upload failed` | Bucket/URL/Service Role salah | Periksa secret di GitHub Actions. |
| Backup terlalu kecil | Hanya berisi struktur kosong | Periksa apakah ada data, atau koneksi ke project yang salah. |
| Workflow gagal berturut-turut | Secret hilang/berubah | Perbarui secret dan jalankan manual. |

**Rekomendasi:** Lakukan **uji pemulihan ke project dev** minimal sekali per semester untuk memastikan backup bisa benar-benar dipakai.
