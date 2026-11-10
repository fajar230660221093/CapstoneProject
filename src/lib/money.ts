/**
 * Utilitas nominal uang.
 *
 * Aturan main: nominal SELALU disimpan sebagai bilangan bulat rupiah
 * (bigint di database). Tidak ada float, tidak ada sen. Fungsi di sini
 * hanya untuk mengubah antara angka dan teks yang dilihat pengguna.
 */

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 0,
});

/**
 * Format nominal menjadi teks "Rp 1.500.000".
 * Nilai negatif ditampilkan sebagai "Rp -1.500.000" (tanda minus di depan
 * angka, bukan di depan "Rp"), agar mudah dibaca.
 */
export function formatRupiah(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === "") return "Rp 0";
  const value = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(value)) return "Rp 0";

  const formatted = rupiahFormatter.format(Math.abs(Math.round(value)));
  return value < 0 ? `-Rp ${formatted}` : `Rp ${formatted}`;
}

/** Format nominal tanpa simbol "Rp" (untuk kolom tabel yang sempit). */
export function formatAmount(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === "") return "0";
  const value = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(value)) return "0";
  return rupiahFormatter.format(Math.round(value));
}

/**
 * Ubah input pengguna menjadi rupiah bulat.
 *
 * Menerima: "15000", "15.000", "15,000", "Rp 15.000", 15000.
 * Mengembalikan null bila tidak bisa dibaca sebagai angka.
 */
export function parseRupiah(input: string | number | null | undefined): number | null {
  if (input === null || input === undefined) return null;
  if (typeof input === "number") {
    return Number.isFinite(input) ? Math.round(input) : null;
  }

  const cleaned = input
    .replace(/rp/gi, "")
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(/,/g, ".")
    .trim();

  if (cleaned === "") return null;

  const value = Number(cleaned);
  if (!Number.isFinite(value)) return null;
  return Math.round(value);
}

/** Tampilan ringkas untuk kartu saldo: 1.500.000 -> "Rp 1,5 jt". */
export function formatRupiahShort(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || !Number.isFinite(amount)) return "Rp 0";
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";

  if (abs >= 1_000_000_000) {
    return `${sign}Rp ${(abs / 1_000_000_000).toFixed(1).replace(".", ",")} M`;
  }
  if (abs >= 1_000_000) {
    return `${sign}Rp ${(abs / 1_000_000).toFixed(1).replace(".", ",")} jt`;
  }
  if (abs >= 10_000) {
    return `${sign}Rp ${Math.round(abs / 1_000)} rb`;
  }
  return `${sign}Rp ${rupiahFormatter.format(abs)}`;
}
