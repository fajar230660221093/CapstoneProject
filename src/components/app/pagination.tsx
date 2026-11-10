import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "cn";

interface PaginationProps {
  /** Halaman saat ini (1-based). */
  page: number;
  /** Total halaman. */
  totalPages: number;
  /** Total item keseluruhan (untuk-teks ringkasan). */
  totalItems: number;
  /** Filter aktif yang harus dipertahankan saat berpindah halaman. */
  params?: Record<string, string | undefined>;
  /** Label item, mis. "transaksi". */
  itemLabel?: string;
  /** Jumlah item per halaman. */
  pageSize?: number;
}

function buildHref(
  page: number,
  params: Record<string, string | undefined>,
): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  if (page > 1) search.set("page", String(page));

  const query = search.toString();
  return query ? `?${query}` : "?";
}

/**
 * Navigasi halaman berbasis query string (server-side).
 *
 * Sengaja memakai <Link> biasa, bukan komponen client: tidak ada JS tambahan
 * yang perlu di-hydrate, dan tabel langsung ter-render server per halaman.
 */
export function Pagination({
  page,
  totalPages,
  totalItems,
  params = {},
  itemLabel = "data",
  pageSize = 25,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  // Jendela halaman: selalu tampilkan halaman sekitar posisi saat ini.
  const windowSize = 2;
  const pages: number[] = [];
  for (
    let candidate = Math.max(1, page - windowSize);
    candidate <= Math.min(totalPages, page + windowSize);
    candidate += 1
  ) {
    pages.push(candidate);
  }

  return (
    <nav
      aria-label="Navigasi halaman"
      className="flex flex-col items-center justify-between gap-3 sm:flex-row"
    >
      <p className="text-xs text-muted-foreground">
        Menampilkan <span className="font-medium text-foreground">{from}</span>–
        <span className="font-medium text-foreground">{to}</span> dari{" "}
        <span className="font-medium text-foreground">{totalItems}</span>{" "}
        {itemLabel}
      </p>

      <div className="flex items-center gap-1">
        {page > 1 ? (
          <Link
            href={buildHref(page - 1, params)}
            aria-label="Halaman sebelumnya"
            className="inline-flex size-8 items-center justify-center rounded-lg border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </Link>
        ) : (
          <span
            aria-hidden
            className="inline-flex size-8 items-center justify-center rounded-lg border text-muted-foreground/40"
          >
            <ChevronLeft className="size-4" />
          </span>
        )}

        {pages.map((number) => (
          <Link
            key={number}
            href={buildHref(number, params)}
            aria-current={number === page ? "page" : undefined}
            className={cn(
              "inline-flex size-8 items-center justify-center rounded-lg border text-sm font-medium transition-colors",
              number === page
                ? "border-transparent bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            {number}
          </Link>
        ))}

        {page < totalPages ? (
          <Link
            href={buildHref(page + 1, params)}
            aria-label="Halaman berikutnya"
            className="inline-flex size-8 items-center justify-center rounded-lg border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        ) : (
          <span
            aria-hidden
            className="inline-flex size-8 items-center justify-center rounded-lg border text-muted-foreground/40"
          >
            <ChevronRight className="size-4" />
          </span>
        )}
      </div>
    </nav>
  );
}
