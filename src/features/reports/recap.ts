import type {
  CashTransactionRow,
  TransactionCategoryRow,
} from "@/types/database";

export interface RecapRow {
  categoryId: string | null;
  label: string;
  income: number;
  expense: number;
  balance: number;
  count: number;
}

export interface MonthlyRecapRow {
  month: string;
  label: string;
  income: number;
  expense: number;
  balance: number;
}

export interface RecapResult {
  rows: RecapRow[];
  monthly: MonthlyRecapRow[];
  totals: {
    income: number;
    expense: number;
    balance: number;
    count: number;
  };
}

/**
 * Bentuk minimal satu transaksi untuk rekap.
 * Dipakai bersama oleh data internal dan data publik (view) supaya
 * perhitungan rekap hanya ada di satu tempat.
 */
export interface RecapEntry {
  transaction_date: string;
  kind: "income" | "expense";
  amount: number;
  categoryKey: string | null;
  categoryLabel: string;
}

const MONTH_LABELS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

/**
 * Susun rekap dari bentuk minimal (dipakai data internal maupun publik).
 * Fungsi murni (tanpa I/O) supaya bisa diuji secara otomatis.
 */
export function buildRecapFromEntries(entries: RecapEntry[]): RecapResult {
  const rows = new Map<string, RecapRow>();
  const monthly = new Map<string, MonthlyRecapRow>();

  const ensureRow = (key: string, label: string): RecapRow => {
    const existing = rows.get(key);
    if (existing) return existing;
    const fresh: RecapRow = {
      categoryId: key === "__tanpa_kategori__" ? null : key,
      label,
      income: 0,
      expense: 0,
      balance: 0,
      count: 0,
    };
    rows.set(key, fresh);
    return fresh;
  };

  const ensureMonth = (month: string): MonthlyRecapRow => {
    const existing = monthly.get(month);
    if (existing) return existing;
    const [year, monthNumber] = month.split("-");
    const fresh: MonthlyRecapRow = {
      month,
      label: `${MONTH_LABELS[Number(monthNumber) - 1] ?? monthNumber} ${year}`,
      income: 0,
      expense: 0,
      balance: 0,
    };
    monthly.set(month, fresh);
    return fresh;
  };

  for (const entry of entries) {
    const key = entry.categoryKey ?? "__tanpa_kategori__";
    const row = ensureRow(key, entry.categoryLabel || "Tanpa kategori");
    const monthRow = ensureMonth(entry.transaction_date.slice(0, 7));

    if (entry.kind === "income") {
      row.income += entry.amount;
      monthRow.income += entry.amount;
    } else {
      row.expense += entry.amount;
      monthRow.expense += entry.amount;
    }

    row.count += 1;
  }

  for (const row of rows.values()) {
    row.balance = row.income - row.expense;
  }
  for (const row of monthly.values()) {
    row.balance = row.income - row.expense;
  }

  const totals = { income: 0, expense: 0, balance: 0, count: 0 };
  for (const row of rows.values()) {
    totals.income += row.income;
    totals.expense += row.expense;
    totals.count += row.count;
  }
  totals.balance = totals.income - totals.expense;

  return {
    rows: [...rows.values()].sort((a, b) => {
      if (b.expense !== a.expense) return b.expense - a.expense;
      if (b.income !== a.income) return b.income - a.income;
      return a.label.localeCompare(b.label, "id");
    }),
    monthly: [...monthly.values()].sort((a, b) =>
      a.month.localeCompare(b.month),
    ),
    totals,
  };
}

/** Rekap dari data transaksi internal (bentuk lengkap). */
export function buildRecap(
  transactions: CashTransactionRow[],
  categories: TransactionCategoryRow[],
): RecapResult {
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  return buildRecapFromEntries(
    transactions.map((transaction) => {
      const category = transaction.category_id
        ? categoryMap.get(transaction.category_id)
        : undefined;

      return {
        transaction_date: transaction.transaction_date,
        kind: transaction.kind,
        amount: transaction.amount,
        categoryKey: category?.id ?? null,
        categoryLabel: category?.label ?? "Tanpa kategori",
      };
    }),
  );
}
