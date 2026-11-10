import { ReceiptText } from "lucide-react";
import { formatTanggal } from "@/lib/dates";
import { formatRupiah } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { PublicTransactionRow, TransactionKind } from "@/types/database";

function KindBadge({ kind }: { kind: TransactionKind }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold",
        kind === "income"
          ? "bg-emerald-100 text-emerald-800"
          : "bg-rose-100 text-rose-700",
      )}
    >
      {kind === "income" ? "Masuk" : "Keluar"}
    </span>
  );
}

function amountLabel(transaction: PublicTransactionRow): string {
  return `${transaction.kind === "income" ? "+" : "-"}${formatRupiah(
    transaction.amount,
  )}`;
}

function amountClass(kind: TransactionKind): string {
  return kind === "income" ? "text-emerald-700" : "text-rose-700";
}

export function PublicTransactionList({
  transactions,
}: {
  transactions: PublicTransactionRow[];
}) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-public-forest/20 bg-white/40 px-6 py-14 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-public-forest/10 text-public-forest">
          <ReceiptText className="size-5" />
        </span>
        <p className="mt-3 font-medium text-public-ink">
          Belum ada transaksi yang cocok
        </p>
        <p className="mt-1 max-w-sm text-sm text-public-muted">
          Coba ubah filter atau pilih periode lain. Transaksi yang disembunyikan
          pengurus tidak ditampilkan di halaman ini.
        </p>
      </div>
    );
  }

  return (
    <>
      <ul className="space-y-3 md:hidden">
        {transactions.map((transaction) => (
          <li
            key={transaction.id}
            className="rounded-3xl border border-public-forest/10 bg-white/70 p-4 shadow-sm shadow-public-forest/5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium text-public-muted">
                  {formatTanggal(transaction.transaction_date)}
                </p>
                <div className="mt-1.5">
                  <KindBadge kind={transaction.kind} />
                </div>
              </div>
              <p
                className={cn(
                  "shrink-0 text-right font-heading text-base font-semibold tabular-nums",
                  amountClass(transaction.kind),
                )}
              >
                {amountLabel(transaction)}
              </p>
            </div>
            <p className="mt-3 text-sm font-medium leading-snug text-public-ink">
              {transaction.description || "Tanpa keterangan"}
            </p>
            <p className="mt-1 text-xs text-public-muted">
              {transaction.category_label ?? "Tanpa kategori"}
            </p>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-hidden rounded-3xl border border-public-forest/10 bg-white/70 shadow-sm shadow-public-forest/5 md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[46rem] text-left text-sm">
            <caption className="sr-only">
              Rincian transaksi kas publik
            </caption>
            <thead>
              <tr className="bg-public-sand/70 text-[11px] font-semibold uppercase tracking-[0.14em] text-public-muted">
                <th scope="col" className="px-5 py-3.5">
                  Tanggal
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Keterangan
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Kategori
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Jenis
                </th>
                <th scope="col" className="px-5 py-3.5 text-right">
                  Nominal
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="border-t border-public-forest/8 transition-colors hover:bg-public-sand/30"
                >
                  <td className="whitespace-nowrap px-5 py-4 text-xs text-public-muted">
                    {formatTanggal(transaction.transaction_date)}
                  </td>
                  <td className="max-w-[22rem] px-5 py-4 font-medium text-public-ink">
                    {transaction.description || "Tanpa keterangan"}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-xs text-public-muted">
                    {transaction.category_label ?? "Tanpa kategori"}
                  </td>
                  <td className="px-5 py-4">
                    <KindBadge kind={transaction.kind} />
                  </td>
                  <td
                    className={cn(
                      "whitespace-nowrap px-5 py-4 text-right font-semibold tabular-nums",
                      amountClass(transaction.kind),
                    )}
                  >
                    {amountLabel(transaction)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
