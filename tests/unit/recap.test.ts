import { describe, expect, it } from "vitest";
import { buildRecap } from "@/features/reports/recap";
import type { CashTransactionRow, TransactionCategoryRow } from "@/types/database";

const baseCategory = (overrides: Partial<TransactionCategoryRow>): TransactionCategoryRow => ({
  id: "cat-1",
  code: "kegiatan",
  label: "Kegiatan",
  kind: "both",
  is_active: true,
  sort_order: 1,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
  ...overrides,
});

const baseTx = (overrides: Partial<CashTransactionRow>): CashTransactionRow => ({
  id: "tx-1",
  period_id: "p-1",
  transaction_date: "2025-03-08",
  kind: "income",
  amount: 100000,
  category_id: "cat-1",
  member_id: null,
  description: null,
  source: "manual",
  is_public: true,
  created_by: "u-1",
  created_at: "2025-03-08T00:00:00Z",
  updated_at: "2025-03-08T00:00:00Z",
  deleted_at: null,
  deleted_by: null,
  ...overrides,
});

describe("buildRecap", () => {
  it("menghitung rekap per kategori dan per bulan", () => {
    const transactions = [
      baseTx({ id: "t1", kind: "income", amount: 150000 }),
      baseTx({ id: "t2", kind: "expense", amount: 50000 }),
      baseTx({
        id: "t3",
        kind: "income",
        amount: 200000,
        transaction_date: "2025-04-10",
      }),
    ];
    const categories = [baseCategory({})];

    const recap = buildRecap(transactions, categories);

    expect(recap.totals.income).toBe(350000);
    expect(recap.totals.expense).toBe(50000);
    expect(recap.totals.balance).toBe(300000);
    expect(recap.rows).toHaveLength(1);
    expect(recap.monthly).toHaveLength(2);
  });

  it("menangani transaksi tanpa kategori", () => {
    const transactions = [baseTx({ category_id: null, description: "Sumbangan" })];
    const recap = buildRecap(transactions, []);

    expect(recap.rows[0].label).toBe("Tanpa kategori");
    expect(recap.rows[0].income).toBe(100000);
  });
});
