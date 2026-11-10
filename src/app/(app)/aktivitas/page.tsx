import type { Metadata } from "next";
import { History } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { Pagination } from "@/components/app/pagination";
import { SelectField } from "@/components/app/select-field";
import { Button } from "@/components/ui/button";
import {
  AUDIT_ACTION_LABELS,
  AUDIT_TABLE_LABELS,
  countAuditLogs,
  listAuditLogs,
} from "@/features/audit/queries";
import { canViewFinance, requireUser } from "@/features/auth/session";
import { formatTanggal } from "@/lib/dates";

export const metadata: Metadata = {
  title: "Log Aktivitas",
};

/** Jumlah baris per halaman. */
const PAGE_SIZE = 25;

interface AktivitasPageProps {
  searchParams: Promise<{ table?: string; action?: string; page?: string }>;
}

export default async function AktivitasPage({
  searchParams,
}: AktivitasPageProps) {
  const user = await requireUser();

  if (!canViewFinance(user.profile.role)) {
    return (
      <div className="space-y-4">
        <PageHeader title="Log Aktivitas" />
        <p className="text-sm text-muted-foreground">
          Log aktivitas hanya dapat dilihat oleh Ketua dan Bendahara.
        </p>
      </div>
    );
  }

  const params = await searchParams;

  const filters = {
    tableName: params.table || undefined,
    action: params.action || undefined,
  };

  const requestedPage = Number.parseInt(params.page ?? "1", 10);
  const page =
    Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const [logs, totalItems] = await Promise.all([
    listAuditLogs({
      ...filters,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    }),
    countAuditLogs(filters),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Log Aktivitas"
        description="Riwayat perubahan data kas dan arsip. Data tidak dapat dihapus."
      />

      <form
        method="get"
        className="grid gap-3 rounded-xl border bg-card p-4 shadow-xs sm:grid-cols-3 sm:items-end"
      >
        <SelectField
          label="Jenis data"
          id="table"
          name="table"
          defaultValue={params.table ?? ""}
        >
          <option value="">Semua jenis</option>
          {Object.entries(AUDIT_TABLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Aksi"
          id="action"
          name="action"
          defaultValue={params.action ?? ""}
        >
          <option value="">Semua aksi</option>
          {Object.entries(AUDIT_ACTION_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </SelectField>
        <Button type="submit" variant="secondary">
          Terapkan
        </Button>
      </form>

      {logs.length === 0 ? (
        <EmptyState
          icon={History}
          title="Belum ada aktivitas"
          description="Perubahan data akan tercatat di sini secara otomatis."
        />
      ) : (
        <>
          <ul className="divide-y overflow-hidden rounded-xl border bg-card shadow-xs">
            {logs.map((log) => (
              <li key={log.id} className="px-4 py-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-medium">
                    {AUDIT_TABLE_LABELS[log.table_name] ?? log.table_name} •{" "}
                    {AUDIT_ACTION_LABELS[log.action] ?? log.action}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatTanggal(log.created_at)}
                  </p>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Oleh {log.actorName ?? "sistem"}
                  {log.actor_role ? ` (${log.actor_role})` : ""}
                </p>
              </li>
            ))}
          </ul>
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={PAGE_SIZE}
            itemLabel="catatan"
            params={{
              table: params.table,
              action: params.action,
            }}
          />
        </>
      )}
    </div>
  );
}
