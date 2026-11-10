"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { canManageFinance, requireUser } from "@/features/auth/session";
import type { CategoryKind } from "@/types/database";

export interface CategoryActionResult {
  ok: boolean;
  error?: string;
}

const categorySchema = z.object({
  code: z
    .string()
    .min(2, "Kode minimal 2 karakter.")
    .max(30)
    .regex(/^[a-z0-9_-]+$/, "Kode hanya boleh huruf kecil, angka, - dan _."),
  label: z.string().min(2, "Nama minimal 2 karakter.").max(60),
  kind: z.enum(["income", "expense", "both"]),
});

/** Tambah kategori transaksi baru. */
export async function createTransactionCategory(input: {
  code: string;
  label: string;
  kind: CategoryKind;
}): Promise<CategoryActionResult> {
  const user = await requireUser();

  if (!canManageFinance(user.profile.role)) {
    return {
      ok: false,
      error: "Hanya Bendahara dan Ketua yang boleh menambah kategori.",
    };
  }

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Data kategori belum benar.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("transaction_categories").insert({
    code: parsed.data.code.toLowerCase(),
    label: parsed.data.label.trim(),
    kind: parsed.data.kind,
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Kode kategori sudah dipakai." };
    }
    return { ok: false, error: `Gagal menambah kategori: ${error.message}` };
  }

  revalidatePath("/kas/kategori");
  revalidatePath("/kas/baru");

  return { ok: true };
}

/** Ubah nama / jenis kategori (kode tidak bisa diubah). */
export async function updateTransactionCategory(input: {
  id: string;
  label: string;
  kind: CategoryKind;
}): Promise<CategoryActionResult> {
  const user = await requireUser();

  if (!canManageFinance(user.profile.role)) {
    return {
      ok: false,
      error: "Hanya Bendahara dan Ketua yang boleh mengubah kategori.",
    };
  }

  const parsed = z
    .object({
      id: z.uuid(),
      label: z.string().min(2, "Nama minimal 2 karakter.").max(60),
      kind: z.enum(["income", "expense", "both"]),
    })
    .safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Data kategori belum benar.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("transaction_categories")
    .update({ label: parsed.data.label.trim(), kind: parsed.data.kind })
    .eq("id", parsed.data.id);

  if (error) {
    return { ok: false, error: `Gagal mengubah kategori: ${error.message}` };
  }

  revalidatePath("/kas/kategori");
  revalidatePath("/kas/baru");

  return { ok: true };
}

/**
 * Nonaktifkan kategori.
 * Kategori tidak dihapus supaya transaksi lama tetap punya makna.
 */
export async function deactivateTransactionCategory(
  id: string,
): Promise<CategoryActionResult> {
  const user = await requireUser();

  if (!canManageFinance(user.profile.role)) {
    return {
      ok: false,
      error: "Hanya Bendahara dan Ketua yang boleh menonaktifkan kategori.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("transaction_categories")
    .update({ is_active: false })
    .eq("id", id);

  if (error) {
    return { ok: false, error: `Gagal menonaktifkan kategori: ${error.message}` };
  }

  revalidatePath("/kas/kategori");
  revalidatePath("/kas/baru");

  return { ok: true };
}

/** Aktifkan kembali kategori. */
export async function activateTransactionCategory(
  id: string,
): Promise<CategoryActionResult> {
  const user = await requireUser();

  if (!canManageFinance(user.profile.role)) {
    return {
      ok: false,
      error: "Hanya Bendahara dan Ketua yang boleh mengaktifkan kategori.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("transaction_categories")
    .update({ is_active: true })
    .eq("id", id);

  if (error) {
    return { ok: false, error: `Gagal mengaktifkan kategori: ${error.message}` };
  }

  revalidatePath("/kas/kategori");
  revalidatePath("/kas/baru");

  return { ok: true };
}
