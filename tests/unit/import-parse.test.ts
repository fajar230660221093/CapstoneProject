import { describe, expect, it } from "vitest";
import {
  parseImportRows,
  parseTanggal,
  parseKind,
  normalizeHeader,
} from "@/features/imports/parse";

describe("parseTanggal", () => {
  it("membaca format DD/MM/YYYY", () => {
    expect(parseTanggal("08/03/2025")).toBe("2025-03-08");
  });

  it("membaca format YYYY-MM-DD", () => {
    expect(parseTanggal("2025-12-31")).toBe("2025-12-31");
  });

  it("membaca format DD-MM-YYYY", () => {
    expect(parseTanggal("31-12-2025")).toBe("2025-12-31");
  });

  it("membaca format dengan nama bulan Indonesia", () => {
    expect(parseTanggal("8 Maret 2025")).toBe("2025-03-08");
  });

  it("mengembalikan null untuk format tidak dikenali", () => {
    expect(parseTanggal("tidak-valid")).toBe(null);
    expect(parseTanggal("")).toBe(null);
  });
});

describe("parseKind", () => {
  it("mendeteksi pemasukan", () => {
    expect(parseKind("Pemasukan")).toBe("income");
    expect(parseKind("masuk")).toBe("income");
  });

  it("mendeteksi pengeluaran", () => {
    expect(parseKind("Pengeluaran")).toBe("expense");
    expect(parseKind("keluar")).toBe("expense");
  });
});

describe("normalizeHeader", () => {
  it("menormalkan nama kolom", () => {
    expect(normalizeHeader("Tanggal Transaksi")).toBe("tanggaltransaksi");
    expect(normalizeHeader("Jenis_Transaksi")).toBe("jenistransaksi");
  });
});

describe("parseImportRows", () => {
  it("memvalidasi dan mengubah baris valid", () => {
    const result = parseImportRows([
      {
        Tanggal: "08/03/2025",
        Jenis: "Pemasukan",
        Nominal: "50.000",
        Kategori: "iuran",
        Keterangan: "Iuran anggota",
      },
    ]);

    expect(result.missingColumns).toEqual([]);
    expect(result.validRows).toHaveLength(1);
    expect(result.validRows[0].amount).toBe(50000);
    expect(result.validRows[0].kind).toBe("income");
    expect(result.totalIncome).toBe(50000);
  });

  it("mendeteksi baris yang bermasalah", () => {
    const result = parseImportRows([
      { Tanggal: "x", Jenis: "abc", Nominal: "0", Keterangan: "" },
    ]);

    expect(result.validRows).toHaveLength(0);
    expect(result.invalidRows.length).toBeGreaterThan(0);
  });

  it("menandai kategori tak dikenal bila daftar dikenal disediakan", () => {
    const result = parseImportRows(
      [
        {
          Tanggal: "08/03/2025",
          Jenis: "Pengeluaran",
          Nominal: "10.000",
          Kategori: "tidak_ada",
        },
      ],
      { knownCategoryCodes: ["operasional", "kegiatan"] },
    );

    expect(result.rows[0].errors).toContain(
      'Kategori "tidak_ada" tidak dikenali.',
    );
  });
});
