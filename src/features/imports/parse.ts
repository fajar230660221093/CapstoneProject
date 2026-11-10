import { parseRupiah } from "@/lib/money";

export type ImportKind = "income" | "expense";

export interface ImportRow {
  rowNumber: number;
  transactionDate: string | null;
  kind: ImportKind | null;
  amount: number | null;
  categoryCode: string | null;
  description: string | null;
  errors: string[];
}

export interface ParseResult {
  rows: ImportRow[];
  validRows: ImportRow[];
  invalidRows: ImportRow[];
  headers: string[];
  missingColumns: string[];
  totalIncome: number;
  totalExpense: number;
  totalBalance: number;
}

const COLUMN_ALIASES = {
  date: ["tanggal", "tgl", "date", "tanggaltransaksi", "tgltransaksi"],
  kind: ["jenis", "jenistransaksi", "jenis transaksi", "type", "keterangan jenis"],
  amount: ["nominal", "jumlah", "amount", "nilai", "nominalrp", "uang"],
  category: ["kategori", "category", "kategoritransaksi"],
  description: [
    "keterangan",
    "keterangantransaksi",
    "uraian",
    "deskripsi",
    "catatan",
    "keterangan transaksi",
    "description",
  ],
} as const;

/** Normalisasi nama kolom: lowercase, tanpa spasi/tilde. */
export function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .replace(/[_\-.]/g, "")
    .replace(/\s+/g, "")
    .trim();
}

/** Cari indeks kolom berdasarkan daftar alias. */
export function findColumn(
  headers: string[],
  aliases: readonly string[],
): number {
  const normalized = headers.map(normalizeHeader);
  for (const alias of aliases) {
    const index = normalized.indexOf(normalizeHeader(alias));
    if (index !== -1) return index;
  }
  return -1;
}

const MONTHS: Record<string, number> = {
  jan: 1,
  januari: 1,
  feb: 2,
  febr: 2,
  februari: 2,
  mar: 3,
  maret: 3,
  apr: 4,
  april: 4,
  mei: 5,
  may: 5,
  jun: 6,
  juni: 6,
  jul: 7,
  juli: 7,
  agu: 8,
  agustus: 8,
  aug: 8,
  sep: 9,
  sept: 9,
  september: 9,
  okt: 10,
  oktober: 10,
  oct: 10,
  nov: 11,
  november: 11,
  des: 12,
  desember: 12,
  dec: 12,
};

function pad(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

/**
 * UbahVarious format tanggal menjadi ISO (YYYY-MM-DD).
 * Mendukung: ISO, DD/MM/YYYY, DD-MM-YYYY, YYYY/MM/DD, "8 Mar 2025",
 * dan nomor seri Excel.
 */
export function parseTanggal(value: unknown): string | null {
  if (value === null || value === undefined) return null;

  if (typeof value === "number" && Number.isFinite(value)) {
    // Nomor seri Excel (hari sejak 1899-12-30).
    const date = new Date(Date.UTC(1899, 11, 30) + value * 86400000);
    if (Number.isNaN(date.getTime())) return null;
    return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
  }

  const text = String(value).trim();
  if (!text) return null;

  // ISO
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(text);
  if (iso) {
    return `${iso[1]}-${pad(Number(iso[2]))}-${pad(Number(iso[3]))}`;
  }

  // YYYY/MM/DD
  const ymd = /^(\d{4})[/.](\d{1,2})[/.](\d{1,2})$/.exec(text);
  if (ymd) {
    return `${ymd[1]}-${pad(Number(ymd[2]))}-${pad(Number(ymd[3]))}`;
  }

  // DD/MM/YYYY atau DD-MM-YYYY
  const dmy = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(text);
  if (dmy) {
    return `${dmy[3]}-${pad(Number(dmy[2]))}-${pad(Number(dmy[1]))}`;
  }

  // "8 Mar 2025" / "8 Maret 2025"
  const longDate = /^(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})$/.exec(text);
  if (longDate) {
    const month = MONTHS[longDate[2].toLowerCase()];
    if (month) {
      return `${longDate[3]}-${pad(month)}-${pad(Number(longDate[1]))}`;
    }
  }

  return null;
}

/** Deteksi jenis transaksi dari teks ("Pemasukan", "M", "Pengeluaran", ...). */
export function parseKind(value: unknown): ImportKind | null {
  if (value === null || value === undefined) return null;

  const text = String(value).trim().toLowerCase();
  if (!text) return null;

  if (
    text.includes("masuk") ||
    text.includes("pemasukan") ||
    text.includes("income") ||
    text.includes("penerimaan") ||
    text === "m" ||
    text === "p" ||
    text === "in"
  ) {
    return "income";
  }

  if (
    text.includes("keluar") ||
    text.includes("pengeluaran") ||
    text.includes("expense") ||
    text.includes("pembayaran") ||
    text === "k" ||
    text === "p" ||
    text === "out"
  ) {
    return "expense";
  }

  return null;
}

export interface ParseOptions {
  /** Kode kategori yang dikenali. Baris dengan kategori tak dikenal akan ditanda. */
  knownCategoryCodes?: string[];
}

const REQUIRED_HEADERS = ["date", "amount"] as const;

/**
 * Ubah baris mentah dari Excel/CSV menjadi baris impor tervalidasi.
 * Fungsi murni (tanpa I/O) supaya bisa diuji secara otomatis.
 */
export function parseImportRows(
  rawRows: Record<string, unknown>[],
  options: ParseOptions = {},
): ParseResult {
  const headers = rawRows.length > 0 ? Object.keys(rawRows[0]) : [];

  const dateIndex = findColumn(headers, COLUMN_ALIASES.date);
  const kindIndex = findColumn(headers, COLUMN_ALIASES.kind);
  const amountIndex = findColumn(headers, COLUMN_ALIASES.amount);
  const categoryIndex = findColumn(headers, COLUMN_ALIASES.category);
  const descriptionIndex = findColumn(headers, COLUMN_ALIASES.description);

  const missingColumns: string[] = [];
  if (dateIndex === -1) missingColumns.push("Tanggal");
  if (amountIndex === -1) missingColumns.push("Nominal");

  const knownCodes = (options.knownCategoryCodes ?? []).map((code) =>
    code.toLowerCase(),
  );

  const rows: ImportRow[] = rawRows.map((raw, index) => {
    const errors: string[] = [];

    const cell = (position: number): unknown => {
      if (position === -1) return undefined;
      const key = headers[position];
      return raw[key];
    };

    const transactionDate = parseTanggal(cell(dateIndex));
    if (!transactionDate) errors.push("Tanggal tidak terbaca.");

    const rawAmount = cell(amountIndex);
    let amount = parseRupiah(
      typeof rawAmount === "number"
        ? rawAmount
        : rawAmount === null || rawAmount === undefined
          ? ""
          : String(rawAmount),
    );
    let kind = parseKind(cell(kindIndex));

    if (amount === null) {
      errors.push("Nominal tidak terbaca.");
      amount = null;
    } else if (amount < 0) {
      // Nominal negatif berarti pengeluaran.
      if (!kind) kind = "expense";
      amount = Math.abs(amount);
    }

    if (amount !== null && amount <= 0) {
      errors.push("Nominal harus lebih dari 0.");
    }

    if (!kind) errors.push("Jenis transaksi tidak dikenali.");

    const categoryRaw = cell(categoryIndex);
    const categoryCode =
      categoryRaw === undefined || categoryRaw === null
        ? null
        : String(categoryRaw).trim().toLowerCase() || null;

    if (categoryCode && knownCodes.length > 0 && !knownCodes.includes(categoryCode)) {
      errors.push(`Kategori "${categoryCode}" tidak dikenali.`);
    }

    const descriptionRaw = cell(descriptionIndex);
    const description =
      descriptionRaw === undefined || descriptionRaw === null
        ? null
        : String(descriptionRaw).trim() || null;

    return {
      rowNumber: index + 2, // +2 karena baris pertama adalah judul kolom
      transactionDate,
      kind,
      amount,
      categoryCode,
      description,
      errors,
    };
  });

  const validRows = rows.filter(
    (row) => row.errors.length === 0 && missingColumns.length === 0,
  );
  const invalidRows = rows.filter((row) => row.errors.length > 0);

  const totalIncome = validRows
    .filter((row) => row.kind === "income")
    .reduce((sum, row) => sum + (row.amount ?? 0), 0);
  const totalExpense = validRows
    .filter((row) => row.kind === "expense")
    .reduce((sum, row) => sum + (row.amount ?? 0), 0);

  return {
    rows,
    validRows,
    invalidRows,
    headers,
    missingColumns,
    totalIncome,
    totalExpense,
    totalBalance: totalIncome - totalExpense,
  };
}

export { REQUIRED_HEADERS };
