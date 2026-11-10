import Link from "next/link";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { publicButtonClasses } from "@/components/public/public-button";
import { cn } from "@/lib/utils";
import type {
  PublicPeriodRow,
  PublicTransactionCategoryRow,
  TransactionKind,
} from "@/types/database";

const FIELD_CLASS =
  "h-11 w-full rounded-2xl border border-public-forest/15 bg-white px-3.5 text-sm text-public-ink outline-none transition-colors placeholder:text-public-muted/70 focus:border-public-leaf focus:ring-3 focus:ring-public-leaf/15";

const LABEL_CLASS =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-public-muted";

interface PublicFilterBarProps {
  periods: PublicPeriodRow[];
  categories: PublicTransactionCategoryRow[];
  selectedPeriodId: string;
  selectedKind: TransactionKind | "";
  selectedCategory: string;
  search: string;
}

export function PublicFilterBar({
  periods,
  categories,
  selectedPeriodId,
  selectedKind,
  selectedCategory,
  search,
}: PublicFilterBarProps) {
  const hasFilters = Boolean(selectedKind || selectedCategory || search);

  const availableCategories = selectedKind
    ? categories.filter(
        (category) =>
          category.kind === selectedKind || category.kind === "both",
      )
    : categories;

  const clearHref = selectedPeriodId
    ? `/transparansi?periode=${selectedPeriodId}`
    : "/transparansi";

  return (
    <form
      action="/transparansi"
      method="get"
      className="rounded-3xl border border-public-forest/10 bg-white/80 p-4 shadow-sm shadow-public-forest/5 backdrop-blur-sm sm:p-5"
    >
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-public-ink">
        <SlidersHorizontal className="size-4 text-public-leaf" />
        Saring laporan
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.1fr_0.9fr_0.9fr_1.4fr_auto] lg:items-end">
        <div>
          <label htmlFor="filter-periode" className={LABEL_CLASS}>
            Periode
          </label>
          <select
            id="filter-periode"
            name="periode"
            defaultValue={selectedPeriodId}
            className={FIELD_CLASS}
          >
            {periods.map((period) => (
              <option key={period.id} value={period.id}>
                {period.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-jenis" className={LABEL_CLASS}>
            Jenis
          </label>
          <select
            id="filter-jenis"
            name="jenis"
            defaultValue={selectedKind}
            className={FIELD_CLASS}
          >
            <option value="">Semua</option>
            <option value="income">Pemasukan</option>
            <option value="expense">Pengeluaran</option>
          </select>
        </div>

        <div>
          <label htmlFor="filter-kategori" className={LABEL_CLASS}>
            Kategori
          </label>
          <select
            id="filter-kategori"
            name="kategori"
            defaultValue={selectedCategory}
            className={FIELD_CLASS}
          >
            <option value="">Semua</option>
            {availableCategories.map((category) => (
              <option key={category.id} value={category.code}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-cari" className={LABEL_CLASS}>
            Cari keterangan
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-public-muted/70" />
            <input
              id="filter-cari"
              name="q"
              type="search"
              defaultValue={search}
              placeholder="Contoh: konsumsi rapat"
              className={cn(FIELD_CLASS, "pl-10")}
            />
          </div>
        </div>

        <button
          type="submit"
          className={publicButtonClasses("primary", "w-full lg:w-auto")}
        >
          Terapkan
        </button>
      </div>

      {hasFilters ? (
        <div className="mt-3 flex items-center justify-end">
          <Link
            href={clearHref}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-public-muted transition-colors hover:text-public-forest"
          >
            <X className="size-3.5" />
            Hapus filter
          </Link>
        </div>
      ) : null}
    </form>
  );
}
