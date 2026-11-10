import ExcelJS from "exceljs";
import Papa from "papaparse";

/**
 * Pembaca berkas impor (Excel/CSV) di sisi server.
 *
 * PENTING: modul ini hanya boleh diimpor dari Route Handler / Server
 * Component. `exceljs` berukuran ~21 MB, tidak boleh pernah masuk ke bundle
 * browser. Sebelumnya parsing dilakukan di dalam komponen `"use client"`,
 * sehingga exceljs & papaparse ikut terunduh ke perangkat pengguna.
 */

/** Ubah nilai sel Excel menjadi teks/number biasa. */
function normalizeCell(value: unknown): unknown {
  if (value === null || value === undefined) return null;

  if (value instanceof Date) return value;

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    if ("result" in record) return record.result ?? null;
    if ("text" in record && typeof record.text === "string") return record.text;
    if ("richText" in record && Array.isArray(record.richText)) {
      return record.richText
        .map((part) =>
          part && typeof part === "object" && "text" in part
            ? String((part as { text: unknown }).text)
            : "",
        )
        .join("");
    }
    if ("error" in record) return null;
  }

  return value;
}

/** Baca berkas Excel (.xlsx) menjadi array objek. */
export async function readExcelRows(
  buffer: ArrayBuffer,
): Promise<Record<string, unknown>[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const sheet = workbook.worksheets[0];
  if (!sheet) return [];

  const headers: string[] = [];
  const result: Record<string, unknown>[] = [];

  sheet.eachRow((row, rowNumber) => {
    // Nilai sel pada ExcelJS memakai indeks kolom mulai dari 1.
    const values = (row.values as unknown[]).slice(1).map(normalizeCell);

    if (rowNumber === 1) {
      values.forEach((value) => {
        headers.push(
          value === null || value === undefined ? "" : String(value).trim(),
        );
      });
      return;
    }

    if (values.every((value) => value === null || value === "")) return;

    const record: Record<string, unknown> = {};
    headers.forEach((header, index) => {
      if (!header) return;
      record[header] = values[index] ?? null;
    });
    result.push(record);
  });

  return result;
}

/** Baca berkas CSV/TSV menjadi array objek. */
export function readCsvRows(
  text: string,
  delimiter?: string,
): Record<string, unknown>[] {
  // Buang BOM bila ada (dihasilkan Excel saat menyimpan CSV).
  const clean = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;

  const result = Papa.parse<Record<string, unknown>>(clean, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
    ...(delimiter ? { delimiter } : {}),
  });

  if (result.errors.length > 0 && result.data.length === 0) {
    throw new Error("Berkas CSV tidak bisa dibaca. Periksa formatnya.");
  }

  return result.data;
}
