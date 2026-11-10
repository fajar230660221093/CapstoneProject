import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { listProfiles } from "@/features/profiles/queries";
import type {
  CashTransactionRow,
  TransactionAttachmentRow,
  TransactionCategoryRow,
  TransactionKind,
} from "@/types/database";

export interface TransactionFilters {
  periodId: string;
  kind?: TransactionKind;
  categoryId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface TransactionListItem extends CashTransactionRow {
  categoryLabel: string | null;
  categoryCode: string | null;
  creatorName: string | null;
  attachments: TransactionAttachmentRow[];
}

/**
 * Daftar kategori transaksi (kecil, diambil penuh lalu dipakai lookup).
 * Di-cache per request supaya tidak di-fetch berulang di halaman yang sama.
 */
export const listTransactionCategories = cache(
  async (): Promise<TransactionCategoryRow[]> => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("transaction_categories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) throw new Error(`Gagal memuat kategori: ${error.message}`);
    return data ?? [];
  },
);

/**
 * Daftar transaksi pada satu periode dengan filter opsional.
 * Lampiran diambil terpisah lalu digabungkan di memori supaya tipe data
 * tetap sederhana dan mudah dibaca.
 */
export async function listTransactions(
  filters: TransactionFilters,
): Promise<TransactionListItem[]> {
  const supabase = await createClient();

  let query = supabase
    .from("cash_transactions")
    .select("*")
    .eq("period_id", filters.periodId)
    .is("deleted_at", null)
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (filters.kind) query = query.eq("kind", filters.kind);
  if (filters.categoryId) query = query.eq("category_id", filters.categoryId);
  if (filters.search?.trim()) {
    query = query.ilike("description", `%${filters.search.trim()}%`);
  }
  if (filters.limit !== undefined) {
    const offset = filters.offset ?? 0;
    query = query.range(offset, offset + filters.limit - 1);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Gagal memuat transaksi: ${error.message}`);

  const rows = data ?? [];
  if (rows.length === 0) return [];

  const [categories, profiles, attachments] = await Promise.all([
    listTransactionCategories(),
    listProfiles(),
    listAttachmentsFor(rows.map((row) => row.id)),
  ]);

  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  return rows.map((row) => {
    const category = row.category_id
      ? categoryMap.get(row.category_id)
      : undefined;
    return {
      ...row,
      categoryLabel: category?.label ?? null,
      categoryCode: category?.code ?? null,
      creatorName: profileMap.get(row.created_by)?.full_name ?? null,
      attachments: attachments.get(row.id) ?? [],
    };
  });
}

/** Lampiran bukti untuk sekumpulan transaksi. */
export async function listAttachmentsFor(
  transactionIds: string[],
): Promise<Map<string, TransactionAttachmentRow[]>> {
  const result = new Map<string, TransactionAttachmentRow[]>();
  if (transactionIds.length === 0) return result;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transaction_attachments")
    .select("*")
    .in("transaction_id", transactionIds);

  if (error) {
    throw new Error(`Gagal memuat lampiran: ${error.message}`);
  }

  for (const attachment of data ?? []) {
    const list = result.get(attachment.transaction_id) ?? [];
    list.push(attachment);
    result.set(attachment.transaction_id, list);
  }

  return result;
}

/** Ambil satu transaksi beserta lampirannya. */
export async function getTransaction(
  id: string,
): Promise<TransactionListItem | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cash_transactions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Gagal memuat transaksi: ${error.message}`);
  if (!data) return null;

  const [categories, profiles, attachments] = await Promise.all([
    listTransactionCategories(),
    listProfiles(),
    listAttachmentsFor([data.id]),
  ]);

  const category = data.category_id
    ? categories.find((c) => c.id === data.category_id)
    : undefined;

  return {
    ...data,
    categoryLabel: category?.label ?? null,
    categoryCode: category?.code ?? null,
    creatorName:
      profiles.find((p) => p.id === data.created_by)?.full_name ?? null,
    attachments: attachments.get(data.id) ?? [],
  };
}

/**
 * Jumlah transaksi yang cocok dengan filter (untuk pagination).
 * Query terpisah dengan `head: true` supaya tidak mengirim baris data.
 */
export async function countTransactions(
  filters: TransactionFilters,
): Promise<number> {
  const supabase = await createClient();

  let query = supabase
    .from("cash_transactions")
    .select("id", { count: "exact", head: true })
    .eq("period_id", filters.periodId)
    .is("deleted_at", null);

  if (filters.kind) query = query.eq("kind", filters.kind);
  if (filters.categoryId) query = query.eq("category_id", filters.categoryId);
  if (filters.search?.trim()) {
    query = query.ilike("description", `%${filters.search.trim()}%`);
  }

  const { count, error } = await query;
  if (error) throw new Error(`Gagal menghitung transaksi: ${error.message}`);
  return count ?? 0;
}

/** Total pemasukan/pengeluaran/saldo untuk satu periode. */
export async function getPeriodTotals(periodId: string): Promise<{
  income: number;
  expense: number;
  balance: number;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("period_balances")
    .select("*")
    .eq("period_id", periodId)
    .maybeSingle();

  if (error) throw new Error(`Gagal memuat saldo: ${error.message}`);

  return {
    income: data?.total_income ?? 0,
    expense: data?.total_expense ?? 0,
    balance: data?.balance ?? 0,
  };
}

/** Semua transaksi pada satu periode (dipakai rekap & ekspor). */
export async function listAllTransactions(periodId: string): Promise<
  CashTransactionRow[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cash_transactions")
    .select("*")
    .eq("period_id", periodId)
    .is("deleted_at", null)
    .order("transaction_date", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Gagal memuat transaksi: ${error.message}`);
  return data ?? [];
}
