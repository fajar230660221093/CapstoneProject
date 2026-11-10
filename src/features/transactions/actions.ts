"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { canManageFinance, requireUser } from "@/features/auth/session";
import { getSelectedPeriod } from "@/features/periods/queries";
import {
  MAX_AMOUNT,
  toTransactionInput,
  transactionFormSchema,
} from "@/features/transactions/schema";
import type { AttachmentMeta } from "@/lib/storage";
import type { TransactionKind } from "@/types/database";

export interface ActionResult {
  ok: boolean;
  error?: string;
  id?: string;
}

const attachmentSchema = z.object({
  storage_path: z.string().min(1),
  file_name: z.string().min(1).max(200),
  file_size: z.number().int().nonnegative(),
  mime_type: z.string().min(1).max(120),
});

const createTransactionSchema = z
  .object({
    kind: z.enum(["income", "expense"]),
    amount: z.number().int().positive().max(MAX_AMOUNT),
    transactionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    categoryId: z.string().nullable(),
    description: z.string().max(500).nullable(),
    attachments: z.array(attachmentSchema).max(5),
  })
  .superRefine((data, ctx) => {
    if (data.kind === "expense" && data.attachments.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["attachments"],
        message: "Pengeluaran wajib melampirkan minimal satu bukti/nota.",
      });
    }
  });

/**
 * Pastikan kategori yang dipilih boleh dipakai untuk jenis transaksi ini.
 * Kategori dengan kind 'both' bisa untuk pemasukan maupun pengeluaran.
 */
async function validateCategory(
  categoryId: string | null,
  kind: TransactionKind,
): Promise<string | null> {
  if (!categoryId) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("transaction_categories")
    .select("*")
    .eq("id", categoryId)
    .maybeSingle();

  if (!data) return "Kategori transaksi tidak ditemukan.";
  if (!data.is_active) return "Kategori transaksi sudah tidak aktif.";

  const allowed =
    data.kind === "both" ||
    (kind === "income" && data.kind === "income") ||
    (kind === "expense" && data.kind === "expense");

  if (!allowed) {
    return "Kategori yang dipilih tidak cocok dengan jenis transaksi.";
  }

  return null;
}

/**
 * Tambah transaksi kas baru.
 * Transaksi dan lampiran dibuat dalam satu transaksi database (RPC),
 * supaya aturan "pengeluaran wajib ada nota" bisa ditegakkan.
 */
export async function createTransaction(input: {
  kind: "income" | "expense";
  amount: number;
  transactionDate: string;
  categoryId: string | null;
  description: string | null;
  attachments: AttachmentMeta[];
}): Promise<ActionResult> {
  const user = await requireUser();

  if (!canManageFinance(user.profile.role)) {
    return { ok: false, error: "Hanya Bendahara yang boleh menambah transaksi." };
  }

  const parsed = createTransactionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Data transaksi belum benar.",
    };
  }

  const data = parsed.data;

  // Periode diambil dari server (periode yang sedang dipilih pengguna),
  // bukan dari kiriman browser, agar transaksi tidak masuk periode keliru.
  const period = await getSelectedPeriod();
  if (!period) {
    return { ok: false, error: "Belum ada periode kepengurusan. Hubungi Ketua." };
  }

  const categoryError = await validateCategory(data.categoryId, data.kind);
  if (categoryError) return { ok: false, error: categoryError };

  const supabase = await createClient();

  const { data: transactionId, error } = await supabase.rpc(
    "create_cash_transaction",
    {
      p_period_id: period.id,
      p_transaction_date: data.transactionDate,
      p_kind: data.kind,
      p_amount: data.amount,
      p_category_id: data.categoryId,
      p_description: data.description,
      p_source: "manual",
      p_attachments: data.attachments,
    },
  );

  if (error) {
    if (error.message.includes("bukti/nota")) {
      return {
        ok: false,
        error: "Pengeluaran wajib melampirkan minimal satu bukti/nota.",
      };
    }
    return { ok: false, error: `Gagal menyimpan transaksi: ${error.message}` };
  }

  revalidatePath("/kas");
  revalidatePath("/dasbor");
  revalidatePath("/kas/rekap");
  revalidatePath("/");
  revalidatePath("/transparansi");

  return { ok: true, id: transactionId };
}

/** Ubah transaksi kas yang sudah ada. */
export async function updateTransaction(input: {
  id: string;
  kind: "income" | "expense";
  amount: number;
  transactionDate: string;
  categoryId: string | null;
  description: string | null;
}): Promise<ActionResult> {
  const user = await requireUser();

  if (!canManageFinance(user.profile.role)) {
    return { ok: false, error: "Hanya Bendahara yang boleh mengubah transaksi." };
  }

  const parsed = z
    .object({
      id: z.uuid(),
      kind: z.enum(["income", "expense"]),
      amount: z.number().int().positive().max(MAX_AMOUNT),
      transactionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      categoryId: z.string().nullable(),
      description: z.string().max(500).nullable(),
    })
    .safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Data transaksi belum benar.",
    };
  }

  const data = parsed.data;
  const categoryError = await validateCategory(data.categoryId, data.kind);
  if (categoryError) return { ok: false, error: categoryError };

  const supabase = await createClient();
  const { error } = await supabase.rpc("update_cash_transaction", {
    p_transaction_id: data.id,
    p_transaction_date: data.transactionDate,
    p_kind: data.kind,
    p_amount: data.amount,
    p_category_id: data.categoryId,
    p_description: data.description,
  });

  if (error) {
    if (error.message.includes("bukti/nota")) {
      return {
        ok: false,
        error: "Pengeluaran wajib melampirkan minimal satu bukti/nota.",
      };
    }
    return { ok: false, error: `Gagal mengubah transaksi: ${error.message}` };
  }

  revalidatePath("/kas");
  revalidatePath(`/kas/${data.id}`);
  revalidatePath("/dasbor");
  revalidatePath("/kas/rekap");
  revalidatePath("/");
  revalidatePath("/transparansi");

  return { ok: true, id: data.id };
}

/**
 * Tampilkan atau sembunyikan transaksi dari halaman publik.
 * Transaksi tetap tersimpan dan tetap dihitung di halaman internal.
 */
export async function setTransactionVisibility(
  id: string,
  isPublic: boolean,
): Promise<ActionResult> {
  const user = await requireUser();

  if (!canManageFinance(user.profile.role)) {
    return {
      ok: false,
      error: "Hanya Bendahara yang boleh mengubah tampilan publik transaksi.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("cash_transactions")
    .update({ is_public: isPublic })
    .eq("id", id);

  if (error) {
    return {
      ok: false,
      error: `Gagal mengubah tampilan publik: ${error.message}`,
    };
  }

  revalidatePath("/kas");
  revalidatePath(`/kas/${id}`);
  revalidatePath("/");
  revalidatePath("/transparansi");

  return { ok: true, id };
}

/**
 * Arsipkan transaksi (soft delete).
 * Data tidak pernah dihapus permanen; arsip tetap bisa dipulihkan.
 */
export async function archiveTransaction(id: string): Promise<ActionResult> {
  const user = await requireUser();

  if (!canManageFinance(user.profile.role)) {
    return { ok: false, error: "Hanya Bendahara yang boleh mengarsipkan transaksi." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("cash_transactions")
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: user.id,
    })
    .eq("id", id);

  if (error) {
    return { ok: false, error: `Gagal mengarsipkan transaksi: ${error.message}` };
  }

  revalidatePath("/kas");
  revalidatePath(`/kas/${id}`);
  revalidatePath("/dasbor");
  revalidatePath("/kas/rekap");
  revalidatePath("/");
  revalidatePath("/transparansi");

  return { ok: true, id };
}

/** Pulihkan transaksi yang diarsipkan. */
export async function restoreTransaction(id: string): Promise<ActionResult> {
  const user = await requireUser();

  if (!canManageFinance(user.profile.role)) {
    return { ok: false, error: "Hanya Bendahara yang boleh memulihkan transaksi." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("cash_transactions")
    .update({ deleted_at: null, deleted_by: null })
    .eq("id", id);

  if (error) {
    return { ok: false, error: `Gagal memulihkan transaksi: ${error.message}` };
  }

  revalidatePath("/kas");
  revalidatePath(`/kas/${id}`);
  revalidatePath("/dasbor");
  revalidatePath("/kas/rekap");
  revalidatePath("/");
  revalidatePath("/transparansi");

  return { ok: true, id };
}

/** Tambahkan bukti/nota pada transaksi pengeluaran yang sudah ada. */
export async function addAttachment(
  transactionId: string,
  attachment: AttachmentMeta,
): Promise<ActionResult> {
  const user = await requireUser();

  if (!canManageFinance(user.profile.role)) {
    return { ok: false, error: "Hanya Bendahara yang boleh menambah lampiran." };
  }

  const parsed = attachmentSchema.safeParse(attachment);
  if (!parsed.success) {
    return { ok: false, error: "Berkas lampiran tidak valid." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("transaction_attachments").insert({
    transaction_id: transactionId,
    storage_path: parsed.data.storage_path,
    file_name: parsed.data.file_name,
    file_size: parsed.data.file_size,
    mime_type: parsed.data.mime_type,
    uploaded_by: user.id,
  });

  if (error) {
    return { ok: false, error: `Gagal menambah lampiran: ${error.message}` };
  }

  revalidatePath(`/kas/${transactionId}`);

  return { ok: true };
}

/** Hapus sebuah lampiran (dicegah database bila menyisakan pengeluaran tanpa nota). */
export async function removeAttachment(
  attachmentId: string,
): Promise<ActionResult> {
  const user = await requireUser();

  if (!canManageFinance(user.profile.role)) {
    return { ok: false, error: "Hanya Bendahara yang boleh menghapus lampiran." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("transaction_attachments")
    .delete()
    .eq("id", attachmentId);

  if (error) {
    if (error.message.includes("bukti/nota")) {
      return {
        ok: false,
        error: "Pengeluaran wajib tetap memiliki minimal satu bukti/nota.",
      };
    }
    return { ok: false, error: `Gagal menghapus lampiran: ${error.message}` };
  }

  revalidatePath("/kas");

  return { ok: true };
}

/** Dipakai modul impor: validasi form transaksi biasa. */
export async function validateTransactionForm(values: unknown) {
  const parsed = transactionFormSchema.safeParse(values);
  if (!parsed.success) return null;
  return toTransactionInput(parsed.data);
}
