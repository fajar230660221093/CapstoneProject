import ExcelJS from "exceljs";
import { formatRupiah } from "@/lib/money";
import { formatTanggal } from "@/lib/dates";
import type { RecapResult } from "./recap";
import type { CashTransactionRow } from "@/types/database";

export interface ExcelExportInput {
  periodName: string;
  organizationName: string;
  recap: RecapResult;
  transactions: CashTransactionRow[];
  categoryLabels: Map<string, string>;
}

function styleHeader(row: ExcelJS.Row) {
  row.font = { bold: true, color: { argb: "FFFFFFFF" } };
  row.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1F2937" },
  };
  row.alignment = { vertical: "middle" };
  row.height = 20;
}

/**
 * Susun berkas rekap (.xlsx) berisi:
 *  - ringkasan per kategori
 *  - rekap per bulan
 *  - daftar transaksi lengkap
 */
export async function buildRecapWorkbook(
  input: ExcelExportInput,
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = input.organizationName;
  workbook.created = new Date();

  // --- Lembar 1: Rekap per kategori -------------------------------
  const summary = workbook.addWorksheet("Rekap Kategori");
  summary.columns = [
    { header: "Kategori", key: "kategori", width: 28 },
    { header: "Jumlah Transaksi", key: "jumlah", width: 18 },
    { header: "Pemasukan", key: "pemasukan", width: 20 },
    { header: "Pengeluaran", key: "pengeluaran", width: 20 },
    { header: "Selisih", key: "selisih", width: 20 },
  ];
  styleHeader(summary.getRow(1));

  summary.mergeCells("A1:E1");
  summary.getCell("A1").value = `REKAPITULASI KAS - ${input.periodName}`;
  summary.getCell("A1").font = { bold: true, size: 14 };
  summary.getCell("A1").alignment = { horizontal: "center" };

  summary.addRow([]);
  summary.addRow(["Organisasi", input.organizationName]);

  const headerRowIndex = summary.rowCount + 1;
  summary.addRow([
    "Kategori",
    "Jumlah Transaksi",
    "Pemasukan",
    "Pengeluaran",
    "Selisih",
  ]);
  styleHeader(summary.getRow(headerRowIndex));

  for (const row of input.recap.rows) {
    summary.addRow([
      row.label,
      row.count,
      row.income,
      row.expense,
      row.balance,
    ]);
  }

  summary.addRow([
    "TOTAL",
    input.recap.totals.count,
    input.recap.totals.income,
    input.recap.totals.expense,
    input.recap.totals.balance,
  ]);
  summary.getRow(summary.rowCount).font = { bold: true };

  summary.eachRow((row, rowNumber) => {
    if (rowNumber <= headerRowIndex) return;
    row.eachCell((cell, colNumber) => {
      if (colNumber >= 3) cell.numFmt = "#,##0";
    });
  });

  // --- Lembar 2: Rekap per bulan ----------------------------------
  const monthly = workbook.addWorksheet("Rekap Bulanan");
  monthly.columns = [
    { header: "Bulan", key: "bulan", width: 20 },
    { header: "Pemasukan", key: "pemasukan", width: 20 },
    { header: "Pengeluaran", key: "pengeluaran", width: 20 },
    { header: "Selisih", key: "selisih", width: 20 },
  ];
  styleHeader(monthly.getRow(1));

  for (const row of input.recap.monthly) {
    monthly.addRow([row.label, row.income, row.expense, row.balance]);
  }

  monthly.addRow([
    "TOTAL",
    input.recap.totals.income,
    input.recap.totals.expense,
    input.recap.totals.balance,
  ]);
  monthly.getRow(monthly.rowCount).font = { bold: true };

  monthly.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    row.eachCell((cell, colNumber) => {
      if (colNumber >= 2) cell.numFmt = "#,##0";
    });
  });

  // --- Lembar 3: Daftar transaksi ---------------------------------
  const detail = workbook.addWorksheet("Transaksi");
  detail.columns = [
    { header: "No", key: "no", width: 6 },
    { header: "Tanggal", key: "tanggal", width: 16 },
    { header: "Jenis", key: "jenis", width: 14 },
    { header: "Kategori", key: "kategori", width: 22 },
    { header: "Keterangan", key: "keterangan", width: 40 },
    { header: "Nominal", key: "nominal", width: 18 },
  ];
  styleHeader(detail.getRow(1));

  input.transactions.forEach((transaction, index) => {
    const categoryLabel = transaction.category_id
      ? (input.categoryLabels.get(transaction.category_id) ?? "-")
      : "-";
    detail.addRow([
      index + 1,
      formatTanggal(transaction.transaction_date),
      transaction.kind === "income" ? "Pemasukan" : "Pengeluaran",
      categoryLabel,
      transaction.description ?? "-",
      transaction.amount,
    ]);
  });

  const totalRow = detail.addRow([
    "",
    "",
    "",
    "",
    "TOTAL",
    input.recap.totals.income - input.recap.totals.expense,
  ]);
  totalRow.font = { bold: true };

  detail.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const nominalCell = row.getCell(6);
    if (typeof nominalCell.value === "number") nominalCell.numFmt = "#,##0";
  });

  detail.views = [{ state: "frozen", ySplit: 1 }];

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

/** Nama berkas unduhan yang aman. */
export function buildFileName(prefix: string, periodName: string): string {
  const slug = periodName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${prefix}-${slug}.xlsx`;
}

export { formatRupiah };
