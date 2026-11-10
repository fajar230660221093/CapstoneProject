import Link from "next/link";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  FolderOpen,
  Plus,
  Wallet,
} from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { MoneyText } from "@/components/app/money-text";
import { PageHeader } from "@/components/app/page-header";
import { PeriodSwitcher } from "@/components/app/period-switcher";
import { StatCard } from "@/components/app/stat-card";
import { Button } from "@/components/ui/button";
import { formatTanggalSingkat } from "@/lib/dates";
import {
  canManageFinance,
  canViewFinance,
  requireUser,
  ROLE_LABELS,
} from "@/features/auth/session";
import { listPeriods, getSelectedPeriod } from "@/features/periods/queries";
import { listDocuments } from "@/features/documents/queries";
import {
  getPeriodTotals,
  listTransactions,
} from "@/features/transactions/queries";

export default async function DashboardPage() {
  const user = await requireUser();
  const role = user.profile.role;

  const [periods, period] = await Promise.all([
    listPeriods(),
    getSelectedPeriod(),
  ]);

  const showFinance = canViewFinance(role);

  const [totals, transactions, documents] = await Promise.all([
    showFinance && period ? getPeriodTotals(period.id) : Promise.resolve(null),
    showFinance && period
      ? listTransactions({ periodId: period.id, limit: 5 })
      : Promise.resolve([]),
    period
      ? listDocuments({ periodId: period.id, limit: 5 })
      : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Halo, ${user.profile.full_name || "Anggota"}`}
        description={`Peran Anda: ${ROLE_LABELS[role]}. ${
          period ? `Periode aktif: ${period.name}.` : "Belum ada periode aktif."
        }`}
        actions={
          <>
            <PeriodSwitcher
              periods={periods.map((p) => ({
                id: p.id,
                name: p.name,
                status: p.status,
              }))}
              currentId={period?.id ?? null}
            />
            {canManageFinance(role) ? (
              <Button asChild size="sm">
                <Link href="/kas/baru">
                  <Plus className="size-4" aria-hidden />
                  Catat Transaksi
                </Link>
              </Button>
            ) : null}
          </>
        }
      />

      {showFinance && totals ? (
        <section
          aria-label="Ringkasan kas"
          className="grid gap-3 sm:grid-cols-3"
        >
          <StatCard
            label="Saldo periode ini"
            icon={Wallet}
            value={
              <MoneyText
                amount={totals.balance}
                className="text-2xl font-semibold tracking-tight"
              />
            }
          />
          <StatCard
            label="Pemasukan"
            icon={ArrowUpCircle}
            tone="positive"
            value={
              <MoneyText
                amount={totals.income}
                className="text-2xl font-semibold tracking-tight"
              />
            }
          />
          <StatCard
            label="Pengeluaran"
            icon={ArrowDownCircle}
            tone="negative"
            value={
              <MoneyText
                amount={totals.expense}
                className="text-2xl font-semibold tracking-tight"
              />
            }
          />
        </section>
      ) : null}

      {showFinance ? (
        <section aria-label="Transaksi terbaru" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-semibold">Transaksi terbaru</h2>
            <Link
              href="/kas"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline"
            >
              Lihat semua
            </Link>
          </div>

          {transactions.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title="Belum ada transaksi"
              description="Transaksi kas yang dicatat akan muncul di sini."
              action={
                canManageFinance(role) ? (
                  <Button asChild size="sm">
                    <Link href="/kas/baru">
                      <Plus className="size-4" aria-hidden />
                      Catat transaksi pertama
                    </Link>
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <ul className="divide-y overflow-hidden rounded-xl border bg-card shadow-xs">
              {transactions.map((transaction) => (
                <li key={transaction.id}>
                  <Link
                    href={`/kas/${transaction.id}`}
                    className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {transaction.description || transaction.categoryLabel ||
                          "Tanpa keterangan"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTanggalSingkat(transaction.transaction_date)}
                        {transaction.categoryLabel
                          ? ` • ${transaction.categoryLabel}`
                          : ""}
                      </p>
                    </div>
                    <MoneyText
                      amount={
                        transaction.kind === "income"
                          ? transaction.amount
                          : -transaction.amount
                      }
                      withSign
                      className="shrink-0 text-sm font-semibold"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      <section aria-label="Arsip terbaru" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-semibold">Arsip terbaru</h2>
          <Link
            href="/arsip"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline"
          >
            Lihat semua
          </Link>
        </div>

        {documents.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="Belum ada dokumen arsip"
            description="Unggah dokumen seperti proposal, laporan, dan-nota kegiatan."
            action={
              <Button asChild size="sm">
                <Link href="/arsip/unggah">
                  <Plus className="size-4" aria-hidden />
                  Unggah dokumen
                </Link>
              </Button>
            }
          />
        ) : (
          <ul className="divide-y overflow-hidden rounded-xl border bg-card shadow-xs">
            {documents.map((document) => (
              <li key={document.id}>
                <Link
                  href={`/arsip/${document.id}`}
                  className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {document.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {document.categoryLabel ?? "Tanpa kategori"} •{" "}
                      {document.year}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {document.versionCount} berkas
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
