import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/features/auth/session";
import { getActivity } from "@/features/activities/queries";
import { ActivityForm } from "../activity-form";

export const metadata: Metadata = {
  title: "Edit Agenda",
};

export default async function EditAgendaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const activity = await getActivity(id);

  if (!activity) notFound();

  return (
    <div className="space-y-5">
      <PageHeader
        title="Edit Agenda"
        description="Perbarui jadwal, status, atau publikasi agenda."
        actions={
          activity.is_public && activity.status !== "cancelled" ? (
            <Button asChild size="sm" variant="outline">
              <Link href={`/agenda#${activity.id}`} target="_blank">
                <ExternalLink className="size-4" />
                Lihat di publik
              </Link>
            </Button>
          ) : undefined
        }
      />

      {activity.status === "cancelled" ? (
        <p className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-sm text-amber-800 dark:text-amber-300">
          Agenda ini sudah dibatalkan. Menyimpan perubahan akan mengembalikan
          statusnya sesuai pilihan di form.
        </p>
      ) : null}

      <Card>
        <CardContent>
          <ActivityForm activity={activity} />
        </CardContent>
      </Card>
    </div>
  );
}
