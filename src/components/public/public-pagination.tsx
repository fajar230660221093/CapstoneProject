import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PublicPaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  params?: Record<string, string | undefined>;
  itemLabel?: string;
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

/** Navigasi halaman dengan gaya situs publik (server-rendered, tanpa JS). */
export function PublicPagination({
  page,
  totalPages,
  totalItems,
  params = {},
  itemLabel = "data",
  pageSize = 25,
}: PublicPaginationProps) {
  if (totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);
  const pages: number[] = [];

  for (
    let candidate = Math.max(1, page - 2);
    candidate <= Math.min(totalPages, page + 2);
    candidate += 1
  ) {
    pages.push(candidate);
  }

  const controlClass =
    "inline-flex size-9 items-center justify-center rounded-full border border-public-forest/15 bg-white/70 text-public-forest transition-colors hover:bg-white";
  const disabledClass =
    "inline-flex size-9 items-center justify-center rounded-full border border-public-forest/10 text-public-muted/40";

  return (
    <nav
      aria-label="Navigasi halaman"
      className="flex flex-col items-center justify-between gap-3 sm:flex-row"
    >
      <p className="text-xs text-public-muted">
        Menampilkan{" "}
        <span className="font-semibold text-public-ink">{from}</span>–
        <span className="font-semibold text-public-ink">{to}</span> dari{" "}
        <span className="font-semibold text-public-ink">{totalItems}</span>{" "}
        {itemLabel}
      </p>

      <div className="flex items-center gap-1.5">
        {page > 1 ? (
          <Link
            href={buildHref(page - 1, params)}
            aria-label="Halaman sebelumnya"
            className={controlClass}
          >
            <ChevronLeft className="size-4" aria-hidden />
          </Link>
        ) : (
          <span aria-hidden className={disabledClass}>
            <ChevronLeft className="size-4" />
          </span>
        )}

        {pages.map((number) => (
          <Link
            key={number}
            href={buildHref(number, params)}
            aria-current={number === page ? "page" : undefined}
            className={cn(
              "inline-flex size-9 items-center justify-center rounded-full border text-sm font-semibold transition-colors",
              number === page
                ? "border-transparent bg-public-forest text-public-cream"
                : "border-public-forest/15 bg-white/70 text-public-forest hover:bg-white",
            )}
          >
            {number}
          </Link>
        ))}

        {page < totalPages ? (
          <Link
            href={buildHref(page + 1, params)}
            aria-label="Halaman berikutnya"
            className={controlClass}
          >
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        ) : (
          <span aria-hidden className={disabledClass}>
            <ChevronRight className="size-4" />
          </span>
        )}
      </div>
    </nav>
  );
}
