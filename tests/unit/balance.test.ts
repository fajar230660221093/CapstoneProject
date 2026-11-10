import { describe, expect, it } from "vitest";
import { computeTotals, addOpeningBalance } from "@/features/transactions/balance";

describe("computeTotals", () => {
  it("menghitung pemasukan, pengeluaran, dan saldo dengan benar", () => {
    const result = computeTotals([
      { kind: "income", amount: 100000 },
      { kind: "expense", amount: 25000 },
      { kind: "income", amount: 50000 },
    ]);

    expect(result.income).toBe(150000);
    expect(result.expense).toBe(25000);
    expect(result.balance).toBe(125000);
  });

  it("mengembalikan nol bila tidak ada transaksi", () => {
    expect(computeTotals([])).toEqual({
      income: 0,
      expense: 0,
      balance: 0,
    });
  });
});

describe("addOpeningBalance", () => {
  it("menambahkan saldo bawaan ke saldo periode berjalan", () => {
    const totals = { income: 200000, expense: 50000, balance: 150000 };
    const result = addOpeningBalance(totals, 75000);

    expect(result.income).toBe(200000);
    expect(result.expense).toBe(50000);
    expect(result.balance).toBe(225000);
  });
});
