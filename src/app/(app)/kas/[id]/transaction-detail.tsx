import Link from "next/link";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { MoneyText } from "@/components/app/money-text";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTanggal } from "@/lib/dates";
import { createSignedUrl } from "@/lib/storage";
import type { TransactionAttachmentRow } from "@/types/database";

interface AttachmentListProps {
  attachments: TransactionAttachmentRow[];
}

export async function AttachmentList({ attachments }: AttachmentListProps) {
  if (attachments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Belum ada bukti/nota terlampir.
      </p>
    );
  }

  const items = await Promise.all(
    attachments.map(async (attachment) => ({
      attachment,
      url: await createSignedUrl("receipts", attachment.storage_path),
    })),
  );

  return (
    <ul className="space-y-2">
      {items.map(({ attachment, url }) => (
        <li
          key={attachment.id}
          className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2"
        >
          <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{attachment.file_name}</p>
            <p className="text-xs text-muted-foreground">
              {attachment.file_size
                ? `${(attachment.file_size / 1024).toFixed(0)} KB`
                : "-"}
            </p>
          </div>
          {url ? (
            <Button asChild variant="outline" size="sm">
              <a href={url} target="_blank" rel="noreferrer">
                <Download className="size-4" aria-hidden />
                Unduh
              </a>
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">
              Tautan gagal dibuat
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

interface TransactionDetailProps {
  transaction: {
    id: string;
    transaction_date: string;
    kind: "income" | "expense";
    amount: number;
    categoryLabel: string | null;
    description: string | null;
    source: string;
    creatorName: string | null;
    created_at: string;
    deleted_at: string | null;
    is_public: boolean;
  };
  attachments: TransactionAttachmentRow[];
}

export function TransactionDetail({
  transaction,
  attachments,
}: TransactionDetailProps) {
  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "Tanggal", value: formatTanggal(transaction.transaction_date) },
    {
      label: "Jenis",
      value:
        transaction.kind === "income" ? "Pemasukan" : "Pengeluaran",
    },
    {
      label: "Nominal",
      value: (
        <MoneyText
          amount={
            transaction.kind === "income"
              ? transaction.amount
              : -transaction.amount
          }
          withSign
          className="text-lg font-semibold"
        />
      ),
    },
    { label: "Kategori", value: transaction.categoryLabel ?? "-" },
    { label: "Keterangan", value: transaction.description ?? "-" },
    { label: "Dicatat oleh", value: transaction.creatorName ?? "-" },
    {
      label: "Tampilan publik",
      value: transaction.is_public ? "Tampil" : "Disembunyikan",
    },
    {
      label: "Sumber",
      value:
        transaction.source === "import"
          ? "Impor data lama (perlu verifikasi bukti)"
          : "Input manual",
    },
  ];

  return (
    <div className="space-y-5">
      <Button asChild variant="ghost" size="sm">
        <Link href="/kas">
          <ArrowLeft className="size-4" aria-hidden />
          Kembali ke daftar kas
        </Link>
      </Button>

      {transaction.deleted_at ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          Transaksi ini sudah diarsipkan dan tidak dihitung dalam saldo.
        </div>
      ) : null}

      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle>Detail Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="divide-y text-sm">
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex items-start justify-between gap-4 py-2.5"
              >
                <dt className="text-muted-foreground">{row.label}</dt>
                <dd className="text-right font-medium">{row.value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle>Bukti / Nota</CardTitle>
        </CardHeader>
        <CardContent>
          <AttachmentList attachments={attachments} />
        </CardContent>
      </Card>
    </div>
  );
}
