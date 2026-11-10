import type { Metadata } from "next";
import Link from "next/link";
import { FolderOpen, Plus } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { Pagination } from "@/components/app/pagination";
import { PeriodSwitcher } from "@/components/app/period-switcher";
import { SelectField } from "@/components/app/select-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  countDocumentsWithFilters,
  listDocumentCategories,
  listDocuments,
} from "@/features/documents/queries";
import { getSelectedPeriod, listPeriods } from "@/features/periods/queries";
import { requireUser } from "@/features/auth/session";
import { formatTanggalPendek } from "@/lib/dates";

export const metadata: Metadata = {
  title: "Arsip",
};

/** Jumlah baris per halaman. */
const PAGE_SIZE = 25;

interface ArsipPageProps {
  searchParams: Promise<{
    category?: string;
    q?: string;
    all?: string;
    page?: string;
  }>;
}

export default async function ArsipPage({ searchParams }: ArsipPageProps) {
  await requireUser();
  const params = await searchParams;

  const [periods, period, categories] = await Promise.all([
    listPeriods(),
    getSelectedPeriod(),
    listDocumentCategories(),
  ]);

  const filters = {
    periodId: params.all === "1" ? undefined : period?.id,
    categoryId: params.category || undefined,
    search: params.q || undefined,
  };

  const requestedPage = Number.parseInt(params.page ?? "1", 10);
  const page =
    Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const [documents, totalItems] = await Promise.all([
    listDocuments({
      ...filters,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    }),
    countDocumentsWithFilters(filters),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Arsip Dokumen"
        description={
          params.all === "1"
            ? "Menampilkan dokumen dari seluruh periode."
            : period
              ? `Dokumen periode ${period.name}.`
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
            <Button asChild size="sm">
              <Link href="/arsip/unggah">
                <Plus className="size-4" aria-hidden />
                Unggah
              </Link>
            </Button>
          </>
        }
      />

      <form
        method="get"
        className="grid gap-3 rounded-xl border bg-card p-4 shadow-xs sm:grid-cols-3 sm:items-end"
      >
        <div className="space-y-1.5">
          <Label htmlFor="q" className="text-xs font-medium">
            Cari judul
          </Label>
          <Input
            id="q"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Kata kunci"
          />
        </div>
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
        <div className="flex items-end gap-2">
          <Button type="submit" variant="secondary">
            Terapkan
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href={params.all === "1" ? "/arsip" : "/arsip?all=1"}>
              {params.all === "1" ? "Periode aktif" : "Semua periode"}
            </Link>
          </Button>
        </div>
      </form>

      {documents.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="Belum ada dokumen"
          description="Unggah proposal, laporan, atau dokumen lain ke arsip organisasi."
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
        <>
          <ul className="divide-y overflow-hidden rounded-xl border bg-card shadow-xs">
            {documents.map((document) => (
              <li key={document.id}>
                <Link
                  href={`/arsip/${document.id}`}
                  className="flex items-start justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{document.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {document.categoryLabel ?? "Tanpa kategori"} • {document.year}
                      {" • "}
                      {document.versionCount} berkas
                      {document.uploaderName
                        ? ` • oleh ${document.uploaderName}`
                        : ""}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatTanggalPendek(document.created_at)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={PAGE_SIZE}
            itemLabel="dokumen"
            params={{
              category: params.category,
              q: params.q,
              all: params.all,
            }}
          />
        </>
      )}
    </div>
  );
}
