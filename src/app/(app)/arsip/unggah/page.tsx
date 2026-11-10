import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { PeriodSwitcher } from "@/components/app/period-switcher";
import { UploadForm } from "./upload-form";
import { listDocumentCategories } from "@/features/documents/queries";
import { listPeriods, getSelectedPeriod } from "@/features/periods/queries";
import { requireUser } from "@/features/auth/session";

export const metadata: Metadata = {
  title: "Unggah Arsip",
};

export default async function UploadDocumentPage() {
  // Satu kali saja: `requireUser()` dipanggil dua kali berarti dua
  // round-trip ke Supabase untuk data yang sama.
  const user = await requireUser();

  const [categories, periods, period] = await Promise.all([
    listDocumentCategories(),
    listPeriods(),
    getSelectedPeriod(),
  ]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Unggah Dokumen"
        description={`Dokumen akan disimpan pada periode ${period?.name ?? "belum ditentukan"}.`}
        actions={
          <PeriodSwitcher
            periods={periods.map((p) => ({
              id: p.id,
              name: p.name,
              status: p.status,
            }))}
            currentId={period?.id ?? null}
          />
        }
      />

      <UploadForm categories={categories} userId={user.id} />
    </div>
  );
}
