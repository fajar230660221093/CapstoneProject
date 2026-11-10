import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowDownCircle,
  ArrowRight,
  ArrowUpCircle,
  BarChart3,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { PublicPagination } from "@/components/public/public-pagination";
import { PublicFilterBar } from "@/components/public/public-filter-bar";
import { PublicLinkButton } from "@/components/public/public-button";
import { PublicPageHero } from "@/components/public/public-page-hero";
import { PublicStat } from "@/components/public/public-stat";
import { PublicTransactionList } from "@/components/public/public-transaction-list";
import { SectionHeading } from "@/components/public/section-heading";
import { TransparencyChart } from "@/components/public/transparency-chart";
import { formatRupiah } from "@/lib/money";
import {
  countPublicTransactions,
  getPublicPeriodTotals,
  listPublicCategories,
  listPublicPeriods,
  listPublicRecapRows,
  listPublicTransactions,
} from "@/features/public/queries";
import { buildPublicRecap } from "@/features/public/recap";
import type { TransactionKind } from "@/types/database";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Transparansi Kas",
  description:
    "Laporan pemasukan, pengeluaran, dan saldo kas Karang Taruna Dusun Tagog yang dapat dibaca publik.",
};

const PAGE_SIZE = 20;

type SearchParamValue = string | string[] | undefined;

interface TransparansiSearchParams {
  periode?: SearchParamValue;
  jenis?: SearchParamValue;
  kategori?: SearchParamValue;
  q?: SearchParamValue;
  page?: SearchParamValue;
}

function firstParam(value: SearchParamValue): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function TransparansiPage({
  searchParams,
}: {
  searchParams: Promise<TransparansiSearchParams>;
}) {
  const params = await searchParams;
  const periodParam = firstParam(params.periode);
  const kindParam = firstParam(params.jenis);
  const categoryParam = firstParam(params.kategori);
  const searchParam = firstParam(params.q);

  const [periods, categories] = await Promise.all([
    listPublicPeriods(),
    listPublicCategories(),
  ]);
  const period =
    periods.find((item) => item.id === periodParam) ??
    periods.find((item) => item.status === "active") ??
    periods[0] ??
    null;

  const kind: TransactionKind | "" =
    kindParam === "income" || kindParam === "expense" ? kindParam : "";
  const requestedCategory = categoryParam.trim();
  const category = categories.some(
    (item) =>
      item.code === requestedCategory &&
      (!kind || item.kind === kind || item.kind === "both"),
  )
    ? requestedCategory
    : "";
  const search = searchParam.trim().slice(0, 100);

  const requestedPage = Number.parseInt(firstParam(params.page) || "1", 10);
  const initialPage =
    Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  if (!period) {
    return (
      <>
        <PublicPageHero
          eyebrow="Transparansi kas"
          title="Kas kami, bisa Anda baca."
          description="Laporan pemasukan, pengeluaran, dan saldo kas organisasi."
        />
        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-dashed border-public-forest/20 bg-white/40 px-6 py-14 text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-public-forest/10 text-public-forest">
              <Wallet className="size-5" />
            </span>
            <p className="mt-3 font-medium text-public-ink">
              Belum ada periode kas
            </p>
            <p className="mx-auto mt-1 max-w-md text-sm text-public-muted">
              Pengurus belum membuat periode laporan. Silakan kembali lagi atau
              hubungi pengurus untuk informasi lebih lanjut.
            </p>
            <PublicLinkButton href="/kontak" variant="secondary" className="mt-5">
              Hubungi pengurus
            </PublicLinkButton>
          </div>
        </section>
      </>
    );
  }

  const filters = {
    periodId: period.id,
    kind: kind || undefined,
    categoryCode: category || undefined,
    search: search || undefined,
  };

  const [totals, recapRows, totalItems] = await Promise.all([
    getPublicPeriodTotals(period.id),
    listPublicRecapRows(period.id),
    countPublicTransactions(filters),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const currentPage = Math.min(initialPage, totalPages);

  const transactions = await listPublicTransactions({
    ...filters,
    limit: PAGE_SIZE,
    offset: (currentPage - 1) * PAGE_SIZE,
  });

  const recap = buildPublicRecap(recapRows);
  const incomeRows = recap.rows
    .filter((row) => row.income > 0)
    .slice(0, 4);
  const expenseRows = recap.rows
    .filter((row) => row.expense > 0)
    .slice(0, 4);
  const maxIncome = Math.max(1, ...incomeRows.map((row) => row.income));
  const maxExpense = Math.max(1, ...expenseRows.map((row) => row.expense));

  return (
    <>
      <PublicPageHero
        eyebrow="Transparansi kas"
        title="Kas kami, bisa Anda baca."
        description="Setiap pemasukan dan pengeluaran yang ditandai publik ditampilkan di sini: tanggal, kategori, keterangan, dan nominalnya. Data pribadi anggota dan bukti nota tetap privat."
      >
        <div className="flex flex-wrap items-center gap-2 text-xs text-public-muted">
          <span className="rounded-full bg-white/70 px-3 py-1.5 font-medium text-public-forest ring-1 ring-public-forest/10">
            {period.name}
          </span>
          <span className="rounded-full bg-white/70 px-3 py-1.5 font-medium text-public-forest ring-1 ring-public-forest/10">
            {totalItems} transaksi cocok
          </span>
        </div>
      </PublicPageHero>

      <section className="mx-auto w-full max-w-6xl space-y-8 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <PublicFilterBar
          periods={periods}
          categories={categories}
          selectedPeriodId={period.id}
          selectedKind={kind}
          selectedCategory={category}
          search={search}
        />

        <div className="grid gap-3 sm:grid-cols-3">
          <PublicStat
            label="Saldo kas"
            value={formatRupiah(totals.balance)}
            hint={`Periode ${period.name}`}
            icon={Wallet}
            tone="forest"
          />
          <PublicStat
            label="Pemasukan"
            value={formatRupiah(totals.income)}
            hint="Seluruh pemasukan publik periode ini"
            icon={ArrowUpCircle}
            tone="leaf"
          />
          <PublicStat
            label="Pengeluaran"
            value={formatRupiah(totals.expense)}
            hint="Seluruh pengeluaran publik periode ini"
            icon={ArrowDownCircle}
            tone="amber"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.45fr_0.85fr]">
          <TransparencyChart monthly={recap.monthly} />

          <div className="rounded-3xl border border-public-forest/10 bg-white/70 p-5 shadow-sm shadow-public-forest/5 sm:p-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="size-4 text-public-leaf" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-public-muted">
                Rekap kategori
              </p>
            </div>

            <div className="mt-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-public-leaf">
                Pemasukan
              </p>
              {incomeRows.length === 0 ? (
                <p className="mt-2 text-sm leading-relaxed text-public-muted">
                  Belum ada pemasukan yang tercatat pada periode ini.
                </p>
              ) : (
                <ul className="mt-3 space-y-3.5">
                  {incomeRows.map((row) => (
                    <li key={`masuk-${row.categoryId ?? row.label}`}>
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="truncate text-sm font-medium text-public-ink">
                          {row.label}
                        </p>
                        <p className="shrink-0 text-xs font-semibold tabular-nums text-public-ink">
                          {formatRupiah(row.income)}
                        </p>
                      </div>
                      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-public-sand">
                        <div
                          className="h-full rounded-full bg-public-leaf"
                          style={{
                            width: `${Math.max(
                              4,
                              (row.income / maxIncome) * 100,
                            )}%`,
                          }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-5 border-t border-public-forest/10 pt-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-public-amber">
                Pengeluaran
              </p>
              {expenseRows.length === 0 ? (
                <p className="mt-2 text-sm leading-relaxed text-public-muted">
                  Belum ada pengeluaran yang tercatat pada periode ini.
                </p>
              ) : (
                <ul className="mt-3 space-y-3.5">
                  {expenseRows.map((row) => (
                    <li key={`keluar-${row.categoryId ?? row.label}`}>
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="truncate text-sm font-medium text-public-ink">
                          {row.label}
                        </p>
                        <p className="shrink-0 text-xs font-semibold tabular-nums text-public-ink">
                          {formatRupiah(row.expense)}
                        </p>
                      </div>
                      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-public-sand">
                        <div
                          className="h-full rounded-full bg-public-amber"
                          style={{
                            width: `${Math.max(
                              4,
                              (row.expense / maxExpense) * 100,
                            )}%`,
                          }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow="Rincian transaksi"
              title="Catatan pemasukan & pengeluaran"
              description="Ditampilkan terbaru lebih dulu. Gunakan filter di atas untuk mempersempit daftar."
            />
            <Link
              href={`/transparansi?periode=${period.id}`}
              className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-public-forest transition-colors hover:text-public-leaf"
            >
              Reset tampilan
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <PublicTransactionList transactions={transactions} />

          <div className="mt-5">
            <PublicPagination
              page={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              params={{
                periode: period.id,
                jenis: kind || undefined,
                kategori: category || undefined,
                q: search || undefined,
              }}
              itemLabel="transaksi"
              pageSize={PAGE_SIZE}
            />
          </div>
        </div>

        <div className="flex gap-3 rounded-3xl border border-public-forest/10 bg-public-forest/5 p-4 sm:p-5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white text-public-forest ring-1 ring-public-forest/10">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-public-ink">
              Yang tidak ditampilkan di halaman publik
            </p>
            <p className="mt-1 text-xs leading-relaxed text-public-muted sm:text-sm">
              Nama anggota, nama pencatat, nomor telepon, lampiran nota, dan log
              aktivitas internal tetap disimpan dalam sistem pengurus. Hanya
              transaksi yang ditandai publik yang muncul di sini.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
