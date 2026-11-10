import { createClient } from "@/lib/supabase/client";
import { buildStoragePath, type StorageBucket } from "@/lib/storage-shared";

/** Batas ukuran berkas: 10 MB (batas bucket Storage & sesuai NFR-01). */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const ACCEPTED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export interface UploadedFile {
  storage_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
}

export interface UploadError {
  message: string;
}

/**
 * Periksa berkas sebelum diunggah.
 * Mengembalikan pesan error dalam bahasa Indonesia, atau null bila aman.
 */
export function validateFile(file: File): UploadError | null {
  if (file.size === 0) {
    return { message: "Berkas kosong. Pilih berkas yang berisi data." };
  }
  if (file.size > MAX_FILE_SIZE) {
    return {
      message: `Ukuran berkas ${(file.size / 1024 / 1024).toFixed(1)} MB terlalu besar. Maksimal 10 MB.`,
    };
  }
  if (
    file.type &&
    !ACCEPTED_MIME_TYPES.includes(file.type) &&
    !file.type.startsWith("image/")
  ) {
    return {
      message:
        "Jenis berkas belum didukung. Gunakan PDF, gambar (JPG/PNG/WebP), Excel, atau CSV.",
    };
  }
  return null;
}

/**
 * Kompres gambar agar hemat kuota Storage (PDF dan berkas lain tidak dikompres).
 *
 * `browser-image-compression` (±55 KB) diimpor secara dinamis, bukan statis,
 * supaya tidak ikut terunduh pada halaman yang tidak pernah mengunggah
 * gambar. Chunk baru diambil ketika benar-benar diperlukan.
 */
async function compressIfNeeded(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  if (file.size < 300 * 1024) return file;

  try {
    const { default: imageCompression } = await import(
      "browser-image-compression"
    );

    const compressed = await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 2000,
      useWebWorker: true,
      initialQuality: 0.8,
    });
    return compressed;
  } catch {
    // Bila kompres gagal, berkas asli tetap diunggah.
    return file;
  }
}

/**
 * Unggah berkas langsung ke Supabase Storage memakai sesi pengguna.
 * Upload langsung (bukan lewat Server Action) karena batas 4,5 MB pada
 * Server Action Vercel terlalu kecil untuk berkas 10 MB.
 */
export async function uploadToBucket(
  bucket: StorageBucket,
  userId: string,
  file: File,
): Promise<UploadedFile> {
  const validation = validateFile(file);
  if (validation) throw new Error(validation.message);

  const prepared = await compressIfNeeded(file);
  const path = buildStoragePath(bucket, userId, file.name);

  const supabase = createClient();
  const { error } = await supabase.storage.from(bucket).upload(path, prepared, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    throw new Error(`Gagal mengunggah berkas: ${error.message}`);
  }

  return {
    storage_path: path,
    file_name: file.name,
    file_size: prepared.size,
    mime_type: prepared.type || "application/octet-stream",
  };
}

/** Hapus berkas yang gagal disimpan (mis. transaksi ditolak database). */
export async function removeUploadedFile(
  bucket: StorageBucket,
  path: string,
): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.storage.from(bucket).remove([path]);
  } catch {
    // Kegagalan menghapus berkas sisa tidak boleh menggagalkan alur utama.
  }
}
