import { NextResponse } from "next/server";
import { canViewFinance, getCurrentUser } from "@/features/auth/session";
import { listTransactionCategories } from "@/features/transactions/queries";
import { parseImportRows } from "@/features/imports/parse";
import { readCsvRows, readExcelRows } from "@/features/imports/server-read";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Batas ukuran berkas (10 MB). */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** Batas baris yang dikirim untuk tabel pratinjau di browser. */
const MAX_PREVIEW_ROWS = 200;

interface PreviewSummary {
  headers: string[];
  missingColumns: string[];
  totalRows: number;
  validCount: number;
  invalidCount: number;
  totalIncome: number;
  totalExpense: number;
  totalBalance: number;
}

function fail(message: string, status: number) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

/**
 * Baca & validasi berkas impor di sisi server.
 *
 * Dipisah dari komponen klien supaya `exceljs` (21 MB) dan `papaparse`
 * tidak pernah ikut terunduh ke browser.
 */
export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user || !canViewFinance(user.profile.role)) {
    return fail("Tidak diizinkan.", 401);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return fail("Permintaan tidak valid.", 400);
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return fail("Berkas tidak ditemukan.", 400);
  }

  if (file.size === 0) {
    return fail("Berkas kosong.", 400);
  }

  if (file.size > MAX_FILE_SIZE) {
    return fail("Ukuran berkas maksimal 10 MB.", 413);
  }

  const fileName = file.name || "";
  const isTsv = /\.tsv$/i.test(fileName);
  const isCsv = /\.csv$/i.test(fileName) || isTsv;

  let rawRows: Record<string, unknown>[];

  try {
    if (isCsv) {
      rawRows = readCsvRows(await file.text(), isTsv ? "\t" : undefined);
    } else {
      rawRows = await readExcelRows(await file.arrayBuffer());
    }
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : "Gagal membaca berkas.",
      400,
    );
  }

  if (rawRows.length === 0) {
    return fail("Berkas kosong atau tidak berisi data.", 400);
  }

  const categories = await listTransactionCategories();

  const parsed = parseImportRows(rawRows, {
    knownCategoryCodes: categories.map((category) => category.code),
  });

  const summary: PreviewSummary = {
    headers: parsed.headers,
    missingColumns: parsed.missingColumns,
    totalRows: parsed.rows.length,
    validCount: parsed.validRows.length,
    invalidCount: parsed.invalidRows.length,
    totalIncome: parsed.totalIncome,
    totalExpense: parsed.totalExpense,
    totalBalance: parsed.totalBalance,
  };

  return NextResponse.json({
    ok: true,
    summary,
    // Pratinjau dibatasi supaya tabel di browser tidak terlalu berat.
    preview: parsed.rows.slice(0, MAX_PREVIEW_ROWS),
    previewTruncated: parsed.rows.length > MAX_PREVIEW_ROWS,
    // Baris valid dikirim balik agar bisa dikirim ulang saat konfirmasi impor.
    validRows: parsed.validRows.map((row) => ({
      transactionDate: row.transactionDate,
      kind: row.kind,
      amount: row.amount,
      categoryCode: row.categoryCode,
      description: row.description,
    })),
  });
}
