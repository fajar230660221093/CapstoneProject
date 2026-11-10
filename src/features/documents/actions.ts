"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  canManageArchive,
  canUploadDocuments,
  requireUser,
} from "@/features/auth/session";
import { getSelectedPeriod } from "@/features/periods/queries";
import type { AttachmentMeta } from "@/lib/storage";

export interface DocumentActionResult {
  ok: boolean;
  error?: string;
  id?: string;
}

const versionSchema = z.object({
  storage_path: z.string().min(1),
  file_name: z.string().min(1).max(200),
  file_size: z.number().int().nonnegative(),
  mime_type: z.string().min(1).max(120),
  note: z.string().max(300).nullable().optional(),
});

const createDocumentSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter.").max(200),
  description: z.string().max(1000).nullable(),
  categoryId: z.string().nullable(),
  versions: z.array(versionSchema).min(1, "Minimal satu berkas.").max(5),
});

/**
 * Buat dokumen arsip baru beserta berkas pertamanya.
 * Pembuatan dokumen + versi berkas dilakukan dalam satu transaksi database.
 */
export async function createDocument(input: {
  title: string;
  description: string | null;
  categoryId: string | null;
  versions: (AttachmentMeta & { note?: string | null })[];
}): Promise<DocumentActionResult> {
  const user = await requireUser();

  if (!canUploadDocuments(user.profile.role)) {
    return { ok: false, error: "Akun Anda tidak berwenang mengunggah arsip." };
  }

  const parsed = createDocumentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Data arsip belum benar.",
    };
  }

  const period = await getSelectedPeriod();
  if (!period) {
    return { ok: false, error: "Belum ada periode kepengurusan. Hubungi Ketua." };
  }

  const data = parsed.data;
  const supabase = await createClient();

  const { data: documentId, error } = await supabase.rpc(
    "create_document_with_version",
    {
      p_period_id: period.id,
      p_title: data.title.trim(),
      p_description: data.description?.trim() ? data.description.trim() : null,
      p_category_id: data.categoryId,
      p_year: period.end_year,
      p_versions: data.versions,
    },
  );

  if (error) {
    return { ok: false, error: `Gagal menyimpan arsip: ${error.message}` };
  }

  revalidatePath("/arsip");
  revalidatePath("/dasbor");

  return { ok: true, id: documentId };
}

/** Tambah versi baru untuk dokumen yang sudah ada. */
export async function addDocumentVersion(
  documentId: string,
  version: AttachmentMeta & { note?: string | null },
): Promise<DocumentActionResult> {
  const user = await requireUser();

  if (!canUploadDocuments(user.profile.role)) {
    return { ok: false, error: "Akun Anda tidak berwenang menambah versi." };
  }

  const parsed = versionSchema.safeParse(version);
  if (!parsed.success) {
    return { ok: false, error: "Berkas tidak valid." };
  }

  const supabase = await createClient();

  const { data: document, error: documentError } = await supabase
    .from("documents")
    .select("id, current_version, status")
    .eq("id", documentId)
    .maybeSingle();

  if (documentError) {
    return { ok: false, error: `Gagal memuat dokumen: ${documentError.message}` };
  }
  if (!document) {
    return { ok: false, error: "Dokumen tidak ditemukan." };
  }
  if (document.status !== "active") {
    return { ok: false, error: "Dokumen sudah diarsipkan." };
  }

  const nextVersion = document.current_version + 1;

  const { error } = await supabase.from("document_versions").insert({
    document_id: documentId,
    version_no: nextVersion,
    storage_path: parsed.data.storage_path,
    file_name: parsed.data.file_name,
    file_size: parsed.data.file_size,
    mime_type: parsed.data.mime_type,
    note: parsed.data.note ?? null,
    uploaded_by: user.id,
  });

  if (error) {
    return { ok: false, error: `Gagal menambah versi: ${error.message}` };
  }

  await supabase
    .from("documents")
    .update({ current_version: nextVersion })
    .eq("id", documentId);

  revalidatePath(`/arsip/${documentId}`);
  revalidatePath("/arsip");

  return { ok: true };
}

/** Arsipkan dokumen (soft delete - data tidak hilang). Hanya Ketua. */
export async function archiveDocument(id: string): Promise<DocumentActionResult> {
  const user = await requireUser();

  if (!canManageArchive(user.profile.role)) {
    return { ok: false, error: "Hanya Ketua yang boleh mengarsipkan dokumen." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("documents")
    .update({ status: "deleted" })
    .eq("id", id);

  if (error) {
    return { ok: false, error: `Gagal mengarsipkan dokumen: ${error.message}` };
  }

  revalidatePath("/arsip");
  revalidatePath(`/arsip/${id}`);

  return { ok: true };
}

/** Pulihkan dokumen dari arsip. Hanya Ketua. */
export async function restoreDocument(id: string): Promise<DocumentActionResult> {
  const user = await requireUser();

  if (!canManageArchive(user.profile.role)) {
    return { ok: false, error: "Hanya Ketua yang boleh memulihkan dokumen." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("documents")
    .update({ status: "active" })
    .eq("id", id);

  if (error) {
    return { ok: false, error: `Gagal memulihkan dokumen: ${error.message}` };
  }

  revalidatePath("/arsip");
  revalidatePath(`/arsip/${id}`);

  return { ok: true };
}
