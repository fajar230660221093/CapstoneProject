import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { canManageFinance, requireUser } from "@/features/auth/session";
import { ImportForm } from "./import-form";

export const metadata: Metadata = {
  title: "Impor Kas",
};

export default async function ImportKasPage() {
  const user = await requireUser();

  if (!canManageFinance(user.profile.role)) {
    return (
      <div className="space-y-4">
        <PageHeader title="Impor Kas" />
        <p className="text-sm text-muted-foreground">
          Hanya Bendahara yang boleh mengimpor data kas lama.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Impor Kas Lama"
        description="Muat data kas dari periode sebelumnya. Baris yang bermasalah tidak akan diimpor."
      />

      <ImportForm />
    </div>
  );
}
