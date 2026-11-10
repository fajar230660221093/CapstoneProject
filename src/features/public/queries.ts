import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type {
  OrganizationProfileRow,
  PeriodBalanceRow,
  PublicActivityRow,
  PublicPeriodRow,
  PublicTransactionCategoryRow,
  PublicTransactionRow,
  TransactionKind,
} from "@/types/database";

/**
 * Query khusus halaman publik.
 *
 * Semua query di sini memakai view `public_*` yang hanya membuka kolom aman.
 * Jangan pernah memakai tabel asli di halaman publik: tabel asli dilindungi
 * RLS dan memuat identitas pencatat, anggota, lampiran, serta audit log.
 */

export interface PublicTransactionFilters {
  periodId: string;
  kind?: TransactionKind;
  categoryCode?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

/** Profil organisasi untuk header/footer/halaman Tentang & Kontak. */
export const getOrganizationProfile = cache(
  async (): Promise<OrganizationProfileRow | null> => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("organization_profiles")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (error) {
      throw new Error(`Gagal memuat profil organisasi: ${error.message}`);
    }

    return data;
  },
);

/** Daftar periode yang boleh tampil di publik, terbaru lebih dulu. */
export async function listPublicPeriods(): Promise<PublicPeriodRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("public_periods")
    .select("*")
    .order("start_year", { ascending: false });

  if (error) throw new Error(`Gagal memuat periode: ${error.message}`);
  return data ?? [];
}

/**
 * Pilih periode publik: parameter URL bila valid, lalu periode aktif,
 * lalu periode terbaru.
 */
export async function getPublicPeriod(
  periodId?: string,
): Promise<PublicPeriodRow | null> {
  const periods = await listPublicPeriods();
  if (periods.length === 0) return null;

  if (periodId) {
    const found = periods.find((period) => period.id === periodId);
    if (found) return found;
  }

  return periods.find((period) => period.status === "active") ?? periods[0];
}

/** Total pemasukan, pengeluaran, dan saldo publik satu periode. */
export async function getPublicPeriodTotals(periodId: string): Promise<{
  income: number;
  expense: number;
  balance: number;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("public_period_balances")
    .select("*")
    .eq("period_id", periodId)
    .maybeSingle();

  if (error) throw new Error(`Gagal memuat saldo publik: ${error.message}`);

  const row = data as PeriodBalanceRow | null;

  return {
    income: row?.total_income ?? 0,
    expense: row?.total_expense ?? 0,
    balance: row?.balance ?? 0,
  };
}

/** Kategori aktif untuk filter laporan publik. */
export async function listPublicCategories(): Promise<
  PublicTransactionCategoryRow[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("public_transaction_categories")
    .select("*")
    .order("label", { ascending: true });

  if (error) throw new Error(`Gagal memuat kategori: ${error.message}`);
  return data ?? [];
}

/** Daftar transaksi publik dengan filter dan pagination. */
export async function listPublicTransactions(
  filters: PublicTransactionFilters,
): Promise<PublicTransactionRow[]> {
  const supabase = await createClient();

  let query = supabase
    .from("public_transactions")
    .select("*")
    .eq("period_id", filters.periodId)
    .order("transaction_date", { ascending: false })
    .order("id", { ascending: false });

  if (filters.kind) query = query.eq("kind", filters.kind);
  if (filters.categoryCode) {
    query = query.eq("category_code", filters.categoryCode);
  }
  if (filters.search?.trim()) {
    query = query.ilike("description", `%${filters.search.trim()}%`);
  }
  if (filters.limit !== undefined) {
    const offset = filters.offset ?? 0;
    query = query.range(offset, offset + filters.limit - 1);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Gagal memuat transaksi publik: ${error.message}`);
  return data ?? [];
}

/** Jumlah transaksi publik yang cocok dengan filter. */
export async function countPublicTransactions(
  filters: PublicTransactionFilters,
): Promise<number> {
  const supabase = await createClient();

  let query = supabase
    .from("public_transactions")
    .select("id", { count: "exact", head: true })
    .eq("period_id", filters.periodId);

  if (filters.kind) query = query.eq("kind", filters.kind);
  if (filters.categoryCode) {
    query = query.eq("category_code", filters.categoryCode);
  }
  if (filters.search?.trim()) {
    query = query.ilike("description", `%${filters.search.trim()}%`);
  }

  const { count, error } = await query;
  if (error) {
    throw new Error(`Gagal menghitung transaksi publik: ${error.message}`);
  }
  return count ?? 0;
}

/**
 * Ambil seluruh baris publik satu periode untuk rekap kategori/bulan.
 * Jumlah transaksi satu periode pada konteks dusun masih wajar, jadi
 * agregasi dilakukan di memori lewat `buildRecapFromEntries`.
 */
export async function listPublicRecapRows(
  periodId: string,
): Promise<PublicTransactionRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("public_transactions")
    .select("*")
    .eq("period_id", periodId)
    .order("transaction_date", { ascending: true });

  if (error) throw new Error(`Gagal memuat rekap publik: ${error.message}`);
  return data ?? [];
}

interface PublicActivityOptions {
  /** Hanya kegiatan yang belum lewat. */
  upcoming?: boolean;
  /** Hanya kegiatan yang sudah lewat. */
  past?: boolean;
  limit?: number;
}

/** Agenda publik, diurutkan sesuai kebutuhan halaman. */
export async function listPublicActivities(
  options: PublicActivityOptions = {},
): Promise<PublicActivityRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("public_activities")
    .select("*")
    .order("starts_at", { ascending: true });

  if (error) throw new Error(`Gagal memuat agenda: ${error.message}`);

  const now = Date.now();
  const endTime = (activity: PublicActivityRow) =>
    new Date(activity.ends_at ?? activity.starts_at).getTime();

  let rows = data ?? [];

  if (options.upcoming) {
    // Kegiatan yang sedang berlangsung tetap masuk daftar mendatang
    // sampai waktu selesainya lewat.
    rows = rows
      .filter((activity) => endTime(activity) >= now)
      .sort(
        (a, b) =>
          new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
      );
  } else if (options.past) {
    rows = rows
      .filter((activity) => endTime(activity) < now)
      .sort(
        (a, b) =>
          new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime(),
      );
  }

  if (options.limit !== undefined) rows = rows.slice(0, options.limit);

  return rows;
}
