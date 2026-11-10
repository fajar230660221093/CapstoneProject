import { describe, expect, it } from "vitest";
import { formatRupiah, parseRupiah, formatAmount } from "@/lib/money";

describe("formatRupiah", () => {
  it("memformat angka menjadi rupiah dengan pemisah ribuan", () => {
    expect(formatRupiah(1500000)).toBe("Rp 1.500.000");
  });

  it("menangani nol", () => {
    expect(formatRupiah(0)).toBe("Rp 0");
  });

  it("menangani nilai null/undefined", () => {
    expect(formatRupiah(null)).toBe("Rp 0");
    expect(formatRupiah(undefined)).toBe("Rp 0");
  });
});

describe("parseRupiah", () => {
  it("membaca angka biasa", () => {
    expect(parseRupiah("15000")).toBe(15000);
  });

  it("membaca format dengan titik ribuan", () => {
    expect(parseRupiah("15.000")).toBe(15000);
    expect(parseRupiah("Rp 1.500.000")).toBe(1500000);
  });

  it("mengembalikan null untuk input kosong atau tidak valid", () => {
    expect(parseRupiah("")).toBe(null);
    expect(parseRupiah(null)).toBe(null);
    expect(parseRupiah("abc")).toBe(null);
  });
});

describe("formatAmount", () => {
  it("memformat tanpa simbol Rp", () => {
    expect(formatAmount(1500000)).toBe("1.500.000");
  });
});
