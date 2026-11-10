import { cn } from "cn";

/**
 * Komponen skeleton untuk state "memuat".
 *
 * Semua blok memakai animasi `animate-pulse` (opacity saja) supaya murah
 * dirender di laptop tanpa GPU, dan ukurannya mirroring layout halaman
 * asli sehingga konten tidak "melompat" saat data tiba.
 */

export function SkeletonBlock({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      aria-hidden
    />
  );
}

/** Kerangka judul halaman + deskripsi. */
export function SkeletonHeader({ actions = true }: { actions?: boolean }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="w-full space-y-2 sm:max-w-xs">
        <SkeletonBlock className="h-6 w-40" />
        <SkeletonBlock className="h-4 w-64" />
      </div>
      {actions ? (
        <div className="flex shrink-0 gap-2">
          <SkeletonBlock className="h-8 w-44" />
          <SkeletonBlock className="h-8 w-32" />
        </div>
      ) : null}
    </div>
  );
}

/** Kerangka kartu statistik (saldo/pemasukan/pengeluaran). */
export function SkeletonStats({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-xl border bg-card p-4 shadow-xs"
          aria-hidden
        >
          <SkeletonBlock className="h-3 w-20" />
          <SkeletonBlock className="mt-3 h-6 w-32" />
        </div>
      ))}
    </div>
  );
}

/** Kerangka baris tabel. */
export function SkeletonTable({
  rows = 8,
  columns = 5,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div
      className="overflow-hidden rounded-xl border bg-card shadow-xs"
      aria-hidden
    >
      <div className="flex gap-4 border-b bg-muted/50 px-4 py-3">
        {Array.from({ length: columns }).map((_, index) => (
          <SkeletonBlock
            key={index}
            className={cn("h-3", index === columns - 1 ? "ml-auto w-16" : "w-24")}
          />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 border-b px-4 py-3.5 last:border-0">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <SkeletonBlock
              key={colIndex}
              className={cn(
                "h-3.5",
                colIndex === columns - 1 ? "ml-auto w-16" : "w-24",
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Kerangka daftar kartu (dipakai di tampilan ponsel). */
export function SkeletonCards({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-3 lg:hidden" aria-hidden>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="rounded-xl border bg-card p-4 shadow-xs">
          <SkeletonBlock className="h-4 w-3/4" />
          <SkeletonBlock className="mt-2 h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

/** Kerangka isi halaman generik. */
export function SkeletonPage() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Memuat halaman…</span>
      <SkeletonHeader />
      <SkeletonStats />
      <div className="mt-5">
        <SkeletonTable />
      </div>
    </div>
  );
}
