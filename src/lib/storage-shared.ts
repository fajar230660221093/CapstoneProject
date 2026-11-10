export type StorageBucket = "documents" | "receipts";

export interface AttachmentMeta {
  storage_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
}

/** Bersihkan nama berkas agar aman dipakai di path Storage. */
export function sanitizeFileName(fileName: string): string {
  const base = fileName.split(/[\\/]/).pop() ?? "berkas";
  const cleaned = base
    .normalize("NFKD")
    .replace(/[^\w.\- ]+/g, "")
    .trim()
    .replace(/\s+/g, "-");
  return cleaned.length > 0 ? cleaned.slice(0, 120) : "berkas";
}

/**
 * Susun path Storage: {bucket}/{userId}/{tahun}/{uuid}-{nama berkas}
 * Path acak mencegah nama berkas menebak-nebak isi berkas lain.
 */
export function buildStoragePath(
  bucket: StorageBucket,
  userId: string,
  fileName: string,
  now: Date = new Date(),
): string {
  const uuid =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${now.getTime()}-${Math.random().toString(36).slice(2, 10)}`;
  return `${bucket}/${userId}/${now.getFullYear()}/${uuid}-${sanitizeFileName(fileName)}`;
}
