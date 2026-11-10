import Link from "next/link";
import { Paperclip } from "lucide-react";
import { MoneyText } from "@/components/app/money-text";
import { formatTanggalPendek } from "@/lib/dates";
import type { TransactionListItem } from "@/features/transactions/queries";
import {
  ArchiveTransactionButton,
  ArchiveTransactionProvider,
} from "./archive-transaction-button";

interface TransactionListProps {
  transactions: TransactionListItem[];
  canManage: boolean;
}

/**
 * Daftar transaksi.
 *
 * Dirender sebagai SATU struktur DOM (bukan tabel + daftar kartu terpisah),
 * yang dir responsif lewat CSS Grid. Sebelumnya data dirender dua kali
 * (sembunyi lewat CSS), sehingga jumlah elemen DOM menjadi ganda.
 */
export function TransactionList({ transactions, canManage }: TransactionListProps) {
  return (
    <ArchiveTransactionProvider>
      <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
        {/* Kepala kolom (desktop) */}
        <div className="hidden border-b bg-muted/40 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid md:grid-cols-[7rem_minmax(0,1fr)_9rem_9rem_9rem] md:gap-x-4">
          <span>Tanggal</span>
          <span>Keterangan</span>
          <span>Kategori</span>
          <span className="text-right">Nominal</span>
          <span className="text-right">Aksi</span>
        </div>

        <ul className="divide-y">
          {transactions.map((transaction) => {
            const amount =
              transaction.kind === "income"
                ? transaction.amount
                : -transaction.amount;
            const categoryLabel = transaction.categoryLabel ?? "-";
            const attachmentCount = transaction.attachments.length;

            return (
              <li
                key={transaction.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-1 px-4 py-3 transition-colors hover:bg-muted/40 md:grid-cols-[7rem_minmax(0,1fr)_9rem_9rem_9rem] md:items-center md:gap-x-4 md:py-2.5"
              >
                {/* Tanggal (desktop) */}
                <span className="hidden text-sm text-muted-foreground md:col-start-1 md:row-start-1 md:block">
                  {formatTanggalPendek(transaction.transaction_date)}
                </span>

                {/* Keterangan */}
                <div className="col-start-1 row-start-1 min-w-0 md:col-start-2 md:row-start-1">
                  <Link
                    href={`/kas/${transaction.id}`}
                    className="font-medium underline-offset-2 hover:underline"
                  >
                    {transaction.description || categoryLabel || "-"}
                  </Link>
                  {transaction.source === "import" ? (
                    <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      Impor
                    </span>
                  ) : null}

                  {/* Meta ringkas (ponsel) */}
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground md:hidden">
                    <span>{formatTanggalPendek(transaction.transaction_date)}</span>
                    <span aria-hidden>&middot;</span>
                    <span className="truncate">{categoryLabel}</span>
                    {attachmentCount > 0 ? (
                      <>
                        <span aria-hidden>&middot;</span>
                        <span className="inline-flex items-center gap-1">
                          <Paperclip className="size-3" aria-hidden />
                          {attachmentCount}
                        </span>
                      </>
                    ) : null}
                  </p>
                </div>

                {/* Kategori + bukti (desktop) */}
                <span className="hidden items-center gap-1.5 text-sm text-muted-foreground md:col-start-3 md:row-start-1 md:flex">
                  <span className="truncate">{categoryLabel}</span>
                  {attachmentCount > 0 ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-xs">
                      <Paperclip className="size-3" aria-hidden />
                      {attachmentCount}
                    </span>
                  ) : null}
                </span>

                {/* Nominal */}
                <div className="col-start-2 row-start-1 md:col-start-4 md:row-start-1">
                  <MoneyText
                    amount={amount}
                    withSign
                    className="font-semibold md:text-right"
                  />
                </div>

                {/* Aksi */}
                <div className="col-start-2 row-start-2 flex items-center justify-end gap-1 md:col-start-5 md:row-start-1">
                  <Link
                    href={`/kas/${transaction.id}`}
                    className="rounded-md px-2 py-1 text-sm text-primary underline-offset-2 hover:underline"
                  >
                    Detail
                  </Link>
                  {canManage ? (
                    <ArchiveTransactionButton
                      id={transaction.id}
                      archived={Boolean(transaction.deleted_at)}
                    />
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </ArchiveTransactionProvider>
  );
}
