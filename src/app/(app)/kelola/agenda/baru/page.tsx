import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/features/auth/session";
import { ActivityForm } from "../activity-form";

export const metadata: Metadata = {
  title: "Tambah Agenda",
};

export default async function TambahAgendaPage() {
  await requireUser();

  return (
    <div className="space-y-5">
      <PageHeader
        title="Tambah Agenda"
        description="Isi informasi kegiatan. Agenda yang ditandai publik akan muncul di halaman warga."
      />
      <Card>
        <CardContent>
          <ActivityForm />
        </CardContent>
      </Card>
    </div>
  );
}
