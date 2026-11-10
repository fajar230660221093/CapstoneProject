import { describe, expect, it } from "vitest";
import { buildRecapFromEntries } from "@/features/reports/recap";

describe("buildRecapFromEntries", () => {
  it("mengelompokkan pemasukan dan pengeluaran per kategori serta bulan", () => {
    const result = buildRecapFromEntries([
      {
        transaction_date: "2026-01-05",
        kind: "income",
        amount: 500_000,
        categoryKey: "iuran",
        categoryLabel: "Iuran",
      },
      {
        transaction_date: "2026-01-12",
        kind: "expense",
        amount: 125_000,
        categoryKey: "kegiatan",
        categoryLabel: "Kegiatan",
      },
      {
        transaction_date: "2026-02-03",
        kind: "income",
        amount: 250_000,
        categoryKey: "donasi",
        categoryLabel: "Donasi",
      },
      {
        transaction_date: "2026-02-20",
        kind: "expense",
        amount: 75_000,
        categoryKey: "kegiatan",
        categoryLabel: "Kegiatan",
      },
    ]);

    expect(result.totals).toEqual({
      income: 750_000,
      expense: 200_000,
      balance: 550_000,
      count: 4,
    });

    expect(result.monthly).toEqual([
      {
        month: "2026-01",
        label: "Januari 2026",
        income: 500_000,
        expense: 125_000,
        balance: 375_000,
      },
      {
        month: "2026-02",
        label: "Februari 2026",
        income: 250_000,
        expense: 75_000,
        balance: 175_000,
      },
    ]);

    expect(result.rows.map((row) => row.label)).toEqual([
      "Kegiatan",
      "Iuran",
      "Donasi",
    ]);
    expect(result.rows[0]).toMatchObject({
      categoryId: "kegiatan",
      income: 0,
      expense: 200_000,
      balance: -200_000,
      count: 2,
    });
  });

  it("memakai label Tanpa kategori bila kategori tidak tersedia", () => {
    const result = buildRecapFromEntries([
      {
        transaction_date: "2026-03-01",
        kind: "expense",
        amount: 20_000,
        categoryKey: null,
        categoryLabel: "Tanpa kategori",
      },
    ]);

    expect(result.rows).toEqual([
      {
        categoryId: null,
        label: "Tanpa kategori",
        income: 0,
        expense: 20_000,
        balance: -20_000,
        count: 1,
      },
    ]);
  });

  it("mengembalikan nilai nol untuk data kosong", () => {
    const result = buildRecapFromEntries([]);

    expect(result.rows).toEqual([]);
    expect(result.monthly).toEqual([]);
    expect(result.totals).toEqual({
      income: 0,
      expense: 0,
      balance: 0,
      count: 0,
    });
  });
});
