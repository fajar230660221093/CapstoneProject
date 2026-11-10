import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Plus } from "lucide-react";
import { ActivityStatusBadge } from "@/components/public/activity-status-badge";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { formatTanggalWaktuJakarta } from "@/lib/dates";
import { requireUser } from "@/features/auth/session";
import { listActivitiesForBoard } from "@/features/activities/queries";
import { ActivityActions } from "./activity-actions";

export const metadata: Metadata = {
  title: "Kelola Agenda",
};

export default async function KelolaAgendaPage() {
  await requireUser();
  const activities = await listActivitiesForBoard();

  return (
    <div className="space-y-5">
      <PageHeader
        title="Kelola Agenda"
        description="Agenda yang ditandai publik akan tampil di halaman /agenda. Agenda internal tetap tersimpan di sini."
        actions={
          <Button asChild size="sm">
            <Link href="/kelola/agenda/baru">
              <Plus className="size-4" />
              Tambah agenda
            </Link>
          </Button>
        }
      />

      {activities.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Belum ada agenda"
          description="Buat agenda pertama untuk kegiatan yang sedang atau akan disiapkan."
          action={
            <Button asChild size="sm">
              <Link href="/kelola/agenda/baru">
                <Plus className="size-4" />
                Buat agenda
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[54rem] text-left text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                  <th scope="col" className="px-4 py-3 font-medium">
                    Kegiatan
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Waktu
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Publik
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {activities.map((activity) => (
                  <tr
                    key={activity.id}
                    className="border-b last:border-0 hover:bg-muted/30"
                  >
                    <td className="max-w-[20rem] px-4 py-3">
                      <Link
                        href={`/kelola/agenda/${activity.id}`}
                        className="font-medium hover:underline"
                      >
                        {activity.title}
                      </Link>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {activity.location ?? "Lokasi menyusul"}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                      {formatTanggalWaktuJakarta(activity.starts_at)}
                    </td>
                    <td className="px-4 py-3">
                      <ActivityStatusBadge status={activity.status} />
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {activity.is_public ? (
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                          Tampil
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          Disembunyikan
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/kelola/agenda/${activity.id}`}>
                            Edit
                          </Link>
                        </Button>
                        <ActivityActions
                          id={activity.id}
                          status={activity.status}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="text-xs leading-relaxed text-muted-foreground">
        Agenda berstatus <strong>Dibatalkan</strong> tidak akan tampil di
        publik. Gunakan tombol <strong>Pulihkan</strong> untuk
        mengembalikannya menjadi agenda yang direncanakan.
      </p>
    </div>
  );
}
