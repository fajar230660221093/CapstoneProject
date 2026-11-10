import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { requireRole } from "@/features/auth/session";
import { getOrganizationProfile } from "@/features/public/queries";
import { PublicSettingsForm } from "./public-settings-form";

export const metadata: Metadata = {
  title: "Pengaturan Publik",
};

export default async function PengaturanPublikPage() {
  await requireRole(["chairman"]);
  const org = await getOrganizationProfile();

  return (
    <div className="space-y-5">
      <PageHeader
        title="Pengaturan Publik"
        description="Atur identitas, cerita, dan kontak yang tampil di situs publik Karang Taruna."
      />

      <PublicSettingsForm
        initialValues={{
          orgName: org?.org_name ?? "Karang Taruna",
          dusunName: org?.dusun_name ?? "Dusun Tagog",
          address: org?.address ?? "",
          tagline:
            org?.tagline ??
            "Bersama membangun dusun, terbuka dalam mengelola.",
          aboutText: org?.about_text ?? "",
          vision: org?.vision ?? "",
          mission: org?.mission ?? "",
          contactPhone: org?.contact_phone ?? "",
          contactEmail: org?.contact_email ?? "",
          instagramUrl: org?.instagram_url ?? "",
          facebookUrl: org?.facebook_url ?? "",
          mapsUrl: org?.maps_url ?? "",
        }}
      />
    </div>
  );
}
