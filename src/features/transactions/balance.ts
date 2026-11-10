import type { TransactionKind } from "@/types/database";

export interface Totals {
  income: number;
  expense: number;
  balance: number;
}

export interface BalanceRow {
  kind: TransactionKind;
  amount: number;
}

export const EMPTY_TOTALS: Totals = { income: 0, expense: 0, balance: 0 };

/**
 * Hitung total pemasukan, pengeluaran, dan saldo dari daftar transaksi.
 * Fungsi murni (tanpa I/O) supaya mudah diuji.
 */
export function computeTotals(rows: BalanceRow[]): Totals {
  let income = 0;
  let expense = 0;

  for (const row of rows) {
    if (row.kind === "income") {
      income += row.amount;
    } else if (row.kind === "expense") {
      expense += row.amount;
    }
  }

  return { income, expense, balance: income - expense };
}

/** Saldo periode berjalan + saldo bawaan dari periode sebelumnya. */
export function addOpeningBalance(
  totals: Totals,
  openingBalance: number,
): Totals {
  return {
    income: totals.income,
    expense: totals.expense,
    balance: totals.balance + openingBalance,
  };
}

/**
 * Pisahkan transaksi menjadi dua kelompok (pemasukan / pengeluaran)
 * lalu hitung totals masing-masing. Dipakai untuk rekap per kategori.
 */
export function computeCategoryTotals(
  rows: BalanceRow[],
  categoryIds: (string | null)[],
): Map<string, Totals> {
  const result = new Map<string, Totals>();

  const ensure = (categoryId: string): Totals => {
    const existing = result.get(categoryId);
    if (existing) return existing;
    const fresh = { ...EMPTY_TOTALS };
    result.set(categoryId, fresh);
    return fresh;
  };

  rows.forEach((row, index) => {
    const categoryId = categoryIds[index] ?? "__tanpa_kategori__";
    const bucket = ensure(categoryId);
    if (row.kind === "income") bucket.income += row.amount;
    else bucket.expense += row.amount;
  });

  for (const bucket of result.values()) {
    bucket.balance = bucket.income - bucket.expense;
  }

  return result;
}
