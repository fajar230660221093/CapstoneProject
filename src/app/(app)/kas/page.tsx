import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Wallet } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { MoneyText } from "@/components/app/money-text";
import { PageHeader } from "@/components/app/page-header";
import { Pagination } from "@/components/app/pagination";
import { PeriodSwitcher } from "@/components/app/period-switcher";
import { SelectField } from "@/components/app/select-field";
import { StatCard } from "@/components/app/stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  canManageFinance,
  canViewFinance,
  requireUser,
} from "@/features/auth/session";
import { getSelectedPeriod, listPeriods } from "@/features/periods/queries";
import {
  countTransactions,
  getPeriodTotals,
  listTransactionCategories,
  listTransactions,
} from "@/features/transactions/queries";
import type { TransactionKind } from "@/types/database";
import { TransactionList } from "./transaction-list";

export const metadata: Metadata = {
  title: "Kas",
};

/** Jumlah baris per halaman. */
const PAGE_SIZE = 25;

interface KasPageProps {
  searchParams: Promise<{
    kind?: string;
    category?: string;
    q?: string;
    archived?: string;
    page?: string;
  }>;
}

export default async function KasPage({ searchParams }: KasPageProps) {
  const user = await requireUser();
  const params = await searchParams;

  if (!canViewFinance(user.profile.role)) {
    return (
      <div className="space-y-4">
        <PageHeader title="Kas" />
        <p className="text-sm text-muted-foreground">
          Data keuangan hanya dapat dilihat oleh Ketua dan Bendahara.
        </p>
      </div>
    );
  }

  const kind: TransactionKind | undefined =
    params.kind === "income" || params.kind === "expense"
      ? params.kind
      : undefined;

  const [periods, period, categories] = await Promise.all([
    listPeriods(),
    getSelectedPeriod(),
    listTransactionCategories(),
  ]);

  const filters = {
    periodId: period?.id ?? "",
    kind,
    categoryId: params.category || undefined,
    search: params.q || undefined,
  };

  const requestedPage = Number.parseInt(params.page ?? "1", 10);
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const [transactions, totalItems, totals] = await Promise.all([
    period
      ? listTransactions({
          ...filters,
          limit: PAGE_SIZE,
          offset: (page - 1) * PAGE_SIZE,
        })
      : Promise.resolve([]),
    period ? countTransactions(filters) : Promise.resolve(0),
    period ? getPeriodTotals(period.id) : Promise.resolve(null),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const canManage = canManageFinance(user.profile.role);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Kas"
        description={
          period
            ? `Transaksi periode ${period.name}.`
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
            {canManage ? (
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

      {totals ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard
            label="Saldo"
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
            tone="negative"
            value={
              <MoneyText
                amount={totals.expense}
                className="text-2xl font-semibold tracking-tight"
              />
            }
          />
        </div>
      ) : null}

      <form
        method="get"
        className="grid gap-3 rounded-xl border bg-card p-4 shadow-xs sm:grid-cols-4 sm:items-end"
      >
        <div className="space-y-1.5">
          <Label htmlFor="q" className="text-xs font-medium">
            Cari keterangan
          </Label>
          <Input
            id="q"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Kata kunci"
          />
        </div>
        <SelectField label="Jenis" id="kind" name="kind" defaultValue={kind ?? ""}>
          <option value="">Semua jenis</option>
          <option value="income">Pemasukan</option>
          <option value="expense">Pengeluaran</option>
        </SelectField>
        <SelectField
          label="Kategori"
          id="category"
          name="category"
          defaultValue={params.category ?? ""}
        >
          <option value="">Semua kategori</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </SelectField>
        <Button type="submit" variant="secondary">
          Terapkan
        </Button>
      </form>

      {transactions.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="Tidak ada transaksi"
          description="Belum ada transaksi yang cocok dengan filter yang dipilih."
          action={
            canManage ? (
              <Button asChild size="sm">
                <Link href="/kas/baru">
                  <Plus className="size-4" aria-hidden />
                  Catat transaksi
                </Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <TransactionList transactions={transactions} canManage={canManage} />
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={PAGE_SIZE}
            itemLabel="transaksi"
            params={{
              kind: params.kind,
              category: params.category,
              q: params.q,
            }}
          />
        </>
      )}
    </div>
  );
}
