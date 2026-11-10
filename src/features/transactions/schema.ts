import { z } from "zod";
import { parseRupiah } from "@/lib/money";

export const MAX_AMOUNT = 1_000_000_000_000; // 1 triliun rupiah

/**
 * Skema validasi form transaksi kas.
 * Kolom `amount` sengaja disimpan sebagai teks agar pengguna bisa mengetik
 * "15.000" atau "15000"; konversi ke angka terjadi di server.
 */
export const transactionFormSchema = z
  .object({
    kind: z.enum(["income", "expense"], {
      message: "Jenis transaksi belum dipilih.",
    }),
    amount: z
      .string()
      .min(1, { message: "Nominal wajib diisi." })
      .max(30, { message: "Nominal terlalu panjang." }),
    transactionDate: z
      .string()
      .min(1, { message: "Tanggal wajib diisi." })
      .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Tanggal belum benar." }),
    categoryId: z.string().optional(),
    description: z
      .string()
      .max(500, { message: "Keterangan maksimal 500 karakter." })
      .optional(),
    hasReceipt: z.boolean(),
  })
  .superRefine((data, ctx) => {
    const amount = parseRupiah(data.amount);

    if (amount === null) {
      ctx.addIssue({
        code: "custom",
        path: ["amount"],
        message: "Nominal harus berupa angka.",
      });
    } else if (amount <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["amount"],
        message: "Nominal harus lebih dari 0.",
      });
    } else if (amount > MAX_AMOUNT) {
      ctx.addIssue({
        code: "custom",
        path: ["amount"],
        message: "Nominal terlalu besar.",
      });
    }

    if (data.kind === "expense" && !data.hasReceipt) {
      ctx.addIssue({
        code: "custom",
        path: ["hasReceipt"],
        message: "Pengeluaran wajib melampirkan minimal satu bukti/nota.",
      });
    }
  });

export type TransactionFormValues = z.infer<typeof transactionFormSchema>;

/** Bentuk data siap simpan (setelah teks nominal diubah menjadi angka). */
export interface TransactionInput {
  kind: "income" | "expense";
  amount: number;
  transactionDate: string;
  categoryId: string | null;
  description: string | null;
  hasReceipt: boolean;
}

/**
 * Ubah hasil validasi form menjadi data siap simpan.
 * Mengembalikan null bila nominal tidak terbaca.
 */
export function toTransactionInput(
  values: TransactionFormValues,
): TransactionInput | null {
  const amount = parseRupiah(values.amount);
  if (amount === null || amount <= 0 || amount > MAX_AMOUNT) return null;

  return {
    kind: values.kind,
    amount,
    transactionDate: values.transactionDate,
    categoryId: values.categoryId ? values.categoryId : null,
    description: values.description?.trim() ? values.description.trim() : null,
    hasReceipt: values.hasReceipt,
  };
}
