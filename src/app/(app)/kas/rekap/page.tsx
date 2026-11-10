import type { Metadata } from "next";
import { ArrowDownCircle, ArrowUpCircle, FileSpreadsheet, FileText, Wallet } from "lucide-react";
import { MoneyText } from "@/components/app/money-text";
import { PageHeader } from "@/components/app/page-header";
import { PeriodSwitcher } from "@/components/app/period-switcher";
import { StatCard } from "@/components/app/stat-card";
import { Button } from "@/components/ui/button";
import {
  canViewFinance,
  requireUser,
} from "@/features/auth/session";
import { getSelectedPeriod, listPeriods } from "@/features/periods/queries";
import {
  listAllTransactions,
  listTransactionCategories,
} from "@/features/transactions/queries";
import { buildRecap } from "@/features/reports/recap";

export const metadata: Metadata = {
  title: "Rekap Kas",
};

export default async function RekapPage() {
  const user = await requireUser();

  if (!canViewFinance(user.profile.role)) {
    return (
      <div className="space-y-4">
        <PageHeader title="Rekap Kas" />
        <p className="text-sm text-muted-foreground">
          Rekap keuangan hanya dapat dilihat oleh Ketua dan Bendahara.
        </p>
      </div>
    );
  }

  const [periods, period, categories] = await Promise.all([
    listPeriods(),
    getSelectedPeriod(),
    listTransactionCategories(),
  ]);

  const transactions = period ? await listAllTransactions(period.id) : [];
  const recap = buildRecap(transactions, categories);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Rekap Kas"
        description={
          period
            ? `Rekapitulasi periode ${period.name} berdasarkan ${recap.totals.count} transaksi.`
            : "Belum ada periode kepengurusan."
        }
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
            <Button asChild size="sm" variant="outline">
              <a href="/api/laporan/rekap/pdf">
                <FileText className="size-4" aria-hidden />
                PDF
              </a>
            </Button>
            <Button asChild size="sm" variant="outline">
              <a href="/api/laporan/rekap/excel">
                <FileSpreadsheet className="size-4" aria-hidden />
                Excel
              </a>
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Saldo akhir"
          icon={Wallet}
          value={
            <MoneyText
              amount={recap.totals.balance}
              className="text-2xl font-semibold tracking-tight"
            />
          }
        />
        <StatCard
          label="Total pemasukan"
          icon={ArrowUpCircle}
          tone="positive"
          value={
            <MoneyText
              amount={recap.totals.income}
              className="text-2xl font-semibold tracking-tight"
            />
          }
        />
        <StatCard
          label="Total pengeluaran"
          icon={ArrowDownCircle}
          tone="negative"
          value={
            <MoneyText
              amount={recap.totals.expense}
              className="text-2xl font-semibold tracking-tight"
            />
          }
        />
      </div>

      <section className="overflow-hidden rounded-xl border bg-card shadow-xs">
        <header className="border-b px-4 py-3">
          <h2 className="font-heading font-semibold">Rekapitulasi per Kategori</h2>
        </header>
        {recap.rows.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted-foreground">
            Belum ada transaksi pada periode ini.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Kategori</th>
                  <th className="px-4 py-3 text-right font-medium">Transaksi</th>
                  <th className="px-4 py-3 text-right font-medium">Pemasukan</th>
                  <th className="px-4 py-3 text-right font-medium">Pengeluaran</th>
                  <th className="px-4 py-3 text-right font-medium">Selisih</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recap.rows.map((row) => (
                  <tr
                    key={row.label}
                    className="transition-colors hover:bg-muted/40"
                  >
                    <td className="px-4 py-2.5 font-medium">{row.label}</td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground">
                      {row.count}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <MoneyText amount={row.income} />
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <MoneyText amount={row.expense} />
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <MoneyText amount={row.balance} withSign />
                    </td>
                  </tr>
                ))}
                <tr className="bg-muted/40 font-semibold">
                  <td className="px-4 py-2.5">TOTAL</td>
                  <td className="px-4 py-2.5 text-right">
                    {recap.totals.count}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <MoneyText amount={recap.totals.income} />
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <MoneyText amount={recap.totals.expense} />
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <MoneyText amount={recap.totals.balance} withSign />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-xl border bg-card shadow-xs">
        <header className="border-b px-4 py-3">
          <h2 className="font-heading font-semibold">Rekapitulasi per Bulan</h2>
        </header>
        {recap.monthly.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted-foreground">
            Belum ada transaksi pada periode ini.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Bulan</th>
                  <th className="px-4 py-3 text-right font-medium">Pemasukan</th>
                  <th className="px-4 py-3 text-right font-medium">Pengeluaran</th>
                  <th className="px-4 py-3 text-right font-medium">Selisih</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recap.monthly.map((row) => (
                  <tr
                    key={row.month}
                    className="transition-colors hover:bg-muted/40"
                  >
                    <td className="px-4 py-2.5 font-medium">{row.label}</td>
                    <td className="px-4 py-2.5 text-right">
                      <MoneyText amount={row.income} />
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <MoneyText amount={row.expense} />
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <MoneyText amount={row.balance} withSign />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
