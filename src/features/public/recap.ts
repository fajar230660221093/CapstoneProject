import { buildRecapFromEntries } from "@/features/reports/recap";
import type { PublicTransactionRow } from "@/types/database";

/** Rekap dari baris view publik. */
export function buildPublicRecap(rows: PublicTransactionRow[]) {
  return buildRecapFromEntries(
    rows.map((row) => ({
      transaction_date: row.transaction_date,
      kind: row.kind,
      amount: row.amount,
      categoryKey: row.category_code,
      categoryLabel: row.category_label ?? "Tanpa kategori",
    })),
  );
}
