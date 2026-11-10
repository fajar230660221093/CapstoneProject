import { createClient } from "@/lib/supabase/server";
import type { StorageBucket } from "@/lib/storage-shared";

export type {
  AttachmentMeta,
  StorageBucket,
} from "@/lib/storage-shared";
export { buildStoragePath, sanitizeFileName } from "@/lib/storage-shared";

/** Buat tautan unduh sementara (berkas arsip bersifat privat). */
export async function createSignedUrl(
  bucket: StorageBucket,
  path: string,
  expiresInSeconds = 300,
): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresInSeconds);

  if (error) {
    console.error("Gagal membuat tautan unduh:", error.message);
    return null;
  }
  return data.signedUrl;
}
