"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { canManageFinance, requireUser } from "@/features/auth/session";
import { getSelectedPeriod } from "@/features/periods/queries";

export interface ImportActionResult {
  ok: boolean;
  imported?: number;
  error?: string;
}

const rowSchema = z.object({
  transactionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  kind: z.enum(["income", "expense"]),
  amount: z.number().int().positive(),
  categoryCode: z.string().max(50).nullable(),
  description: z.string().max(500).nullable(),
});

/**
 * Impor transaksi kas lama sekaligus.
 *
 * Catatan: transaksi hasil impor ber-source 'import', sehingga tidak wajib
 * menyertakan bukti/nota (nota fisiknya sudah ada di arsip lama).
 * Semua baris divalidasi ulang di server sebelum disimpan.
 */
export async function importTransactions(
  rows: {
    transactionDate: string;
    kind: "income" | "expense";
    amount: number;
    categoryCode: string | null;
    description: string | null;
  }[],
): Promise<ImportActionResult> {
  const user = await requireUser();

  if (!canManageFinance(user.profile.role)) {
    return { ok: false, error: "Hanya Bendahara yang boleh mengimpor data kas." };
  }

  if (!Array.isArray(rows) || rows.length === 0) {
    return { ok: false, error: "Tidak ada data untuk diimpor." };
  }

  if (rows.length > 2000) {
    return {
      ok: false,
      error: "Maksimal 2.000 baris per impor. Pisahkan menjadi beberapa berkas.",
    };
  }

  const parsed = z.array(rowSchema).safeParse(rows);
  if (!parsed.success) {
    return {
      ok: false,
      error:
        parsed.error.issues[0]?.message ??
        "Ada baris yang tidak valid. Periksa kembali data Anda.",
    };
  }

  const period = await getSelectedPeriod();
  if (!period) {
    return { ok: false, error: "Belum ada periode kepengurusan. Hubungi Ketua." };
  }

  const payload = parsed.data.map((row) => ({
    transaction_date: row.transactionDate,
    kind: row.kind,
    amount: row.amount,
    category_code: row.categoryCode,
    description: row.description,
  }));

  const supabase = await createClient();
  const { data: imported, error } = await supabase.rpc(
    "import_cash_transactions",
    {
      p_period_id: period.id,
      p_rows: payload,
    },
  );

  if (error) {
    return { ok: false, error: `Gagal mengimpor data: ${error.message}` };
  }

  revalidatePath("/kas");
  revalidatePath("/dasbor");
  revalidatePath("/kas/rekap");
  revalidatePath("/");
  revalidatePath("/transparansi");

  return { ok: true, imported: imported ?? parsed.data.length };
}
