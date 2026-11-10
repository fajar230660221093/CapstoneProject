# Panduan Pengguna - SIM Karang Taruna Dusun Tagog

Dokumen ini ditujukan untuk **Ketua, Bendahara, dan Pengurus** yang akan menggunakan aplikasi harian.

## 1. Tujuan Aplikasi

Aplikasi ini membantu mengelola:

- Arsip dokumen (proposal, laporan, SK, dan dokumen lain) dengan riwayat versi.
- Kas organisasi (pemasukan dan pengeluaran) dilengkapi bukti/nota.
- Rekapitulasi kas yang bisa diekspor ke PDF maupun Excel.
- Agenda kegiatan yang bisa ditampilkan ke publik.
- Halaman publik berisi agenda dan laporan kas yang dapat dibaca warga tanpa login.
- Catatan aktivitas (log audit) untuk menjaga transparansi.

## 2. Halaman Utama

- **Dasbor**: ringkasan saldo, transaksi terbaru, dan arsip terbaru.
- **Arsip**: daftar seluruh dokumen terorganisir berdasarkan kategori dan periode.
- **Kas**: daftar transaksi, tombol catat transaksi, dan ringkasan saldo.
- **Rekap**: rekapitulasi per kategori dan per bulan. Bisa diunduh sebagai PDF/Excel.
- **Agenda**: mengelola kegiatan yang tampil di halaman publik.
- **Log Aktivitas**: riwayat tindakan penting (hanya Ketua & Bendahara).
- **Pengaturan Publik**: mengatur cerita, visi, misi, dan kontak organisasi (hanya Ketua).

## 3. Hak Akses

| Peran | Baca keuangan | Tulis keuangan | Kelola arsip | Kelola agenda | Kelola periode & anggota | Log aktivitas |
|---|---|---|---|---|---|---|
| Ketua | Ya | Tidak | Ya (arsip/pulihkan) | Ya | Ya | Ya |
| Bendahara | Ya | Ya (tambah/ubah/arsip) | Ya | Ya | Terbatas | Ya |
| Pengurus | Tidak | Tidak | Ya (unggah/unduh) | Ya | Tidak | Tidak |

> **Penting:** Aturan ini ditegakkan oleh **Row Level Security (RLS)** di database. Menyembunyikan tombol di UI tidak cukup; sistem tetap melindungi data.

## 4. Mengunggah Arsip Dokumen

1. Buka **Arsip** → **Unggah**.
2. Isi **Judul**, **Kategori**, dan **Keterangan** (opsional).
3. Pilih **1–5 berkas**. Berkas pertama menjadi **versi 1**.
4. Klik **Unggah**.

**Ketentuan:**

- Format yang didukung: PDF, JPG/PNG/WebP, XLSX/XLS/CSV, DOCX.
- Ukuran maksimal 10 MB per berkas.
- Semua berkas disimpan secara privat; hanya anggota yang berhak bisa mengunduh.

## 5. Mencatat Transaksi Kas

1. Buka **Kas** → **Catat Transaksi**.
2. Pilih **Pemasukan** atau **Pengeluaran**.
3. Isi **Tanggal**, **Nominal**, **Kategori**, dan **Keterangan** (opsional).
4. Untuk **Pengeluaran**, wajib melampirkan **bukti/nota** (maks. 10 MB).
5. Klik **Simpan Transaksi**.

**Ketentuan:**

- Nominal disimpan sebagai **rupiah bulat** (tidak ada sen).
- Bukti/nota hanya bisa dibuka oleh **Ketua** dan **Bendahara**.
- Transaksi bisa **diarsipkan** (tidak dihapus), lalu **dipulihkan** bila diperlukan.
- Di halaman detail transaksi, Bendahara bisa menekan **Tampil di publik** untuk
  menyembunyikan atau menampilkan transaksi itu di `/transparansi`. Transaksi
  yang disembunyikan tetap dihitung di aplikasi internal.

## 6. Rekapitulasi & Ekspor

1. Buka **Rekap**.
2. Pilih periode yang ingin dilihat (bisa diganti lewat "Pilih periode").
3. Unduh: **PDF** untuk laporan pertanggungjawaban, **Excel** untuk analisis lebih lanjut.

Berkas yang diunduh hanya bisa dibuat oleh **Ketua** dan **Bendahara**.

## 7. Mengelola Agenda

1. Buka **Agenda** → **Tambah agenda**.
2. Isi nama kegiatan, tanggal/jam (WIB), lokasi, dan deskripsi.
3. Centang **Tampilkan di halaman publik** agar warga bisa melihatnya.
4. Simpan. Agenda akan muncul di `/agenda` dan beranda publik.

Agenda yang **Dibatalkan** tidak tampil di publik. Gunakan **Pulihkan** untuk
mengembalikannya menjadi agenda yang direncanakan.

## 8. Mengatur Halaman Publik

Khusus **Ketua**:

1. Buka **Pengaturan Publik**.
2. Lengkapi identitas, tagline, cerita, visi, misi, dan kontak.
3. Untuk misi, tulis satu poin per baris.
4. Simpan, lalu buka tautan **Lihat halaman publik**.

Bagian kontak yang kosong tidak ditampilkan sebagai tautan aktif. Halaman publik
selalu terang dan tidak menampilkan nama anggota, pencatat, lampiran, atau audit
log.

## 9. Impor Kas Lama

1. Buka **Kas** → **Impor Kas**.
2. Unduh **contoh format** untuk memastikan kolom benar.
3. Unggah berkas **XLSX** atau **CSV**.
4. Tinjau baris **valid** vs **bermasalah**. Baris bermasalah tidak akan diimpor.
5. Klik **Impor X transaksi** untuk mengeksekusi.

**Catatan:** Transaksi hasil impor ber-sumber **Impor**. Aturan "wajib ada nota" tidak diberlakukan, karena nota fisiknya bisa jadi sudah terarsip tersendiri.

## 10. Tips Penggunaan

- Gunakan **kategori** yang konsisten agar rekap lebih rapi.
- Selalu lampirkan nota pada setiap pengeluaran.
- Cek **Log Aktivitas** secara berkala untuk melihat perubahan data.
- Periode baru bisa dibuat oleh **Ketua** saat kepengurusan berganti.
- Periksa tampilan `/transparansi` dan `/agenda` setelah menambah data, agar
  informasi publik tetap rapi.

**Pertanyaan teknis?** Hubungi admin yang bertanggung jawab atas aplikasi.
