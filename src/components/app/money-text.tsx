import { formatRupiah } from "@/lib/money";

interface MoneyTextProps {
  amount: number | null | undefined;
  className?: string;
  /** Tampilkan tanda + / - di depan nominal (untuk pemasukan/pengeluaran). */
  withSign?: boolean;
  /** Paksa warna netral (tanpa hijau/merah). */
  neutral?: boolean;
}

/**
 * Menampilkan nominal uang dalam format rupiah.
 * Sumber kebenaran tetap angka bulat (bigint); pemformatan hanya di layer tampilan.
 */
export function MoneyText({
  amount,
  className,
  withSign = false,
  neutral = false,
}: MoneyTextProps) {
  const value = amount ?? 0;
  const formatted = formatRupiah(Math.abs(value));

  let sign = "";
  if (withSign && value !== 0) {
    sign = value > 0 ? "+" : "-";
  }

  const tone = neutral
    ? ""
    : value > 0
      ? "text-emerald-600 dark:text-emerald-400"
      : value < 0
        ? "text-destructive"
        : "";

  return (
    <span className={`tabular-nums ${tone} ${className ?? ""}`}>
      {sign}
      {formatted}
    </span>
  );
}
