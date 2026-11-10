import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PublicFooter } from "@/components/public/public-footer";
import { PublicHeader } from "@/components/public/public-header";
import { getOrganizationProfile } from "@/features/public/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Karang Taruna Dusun Tagog",
    template: "%s | Karang Taruna Dusun Tagog",
  },
  description:
    "Situs resmi Karang Taruna Dusun Tagog: agenda kegiatan, laporan kas yang terbuka, dan informasi organisasi.",
};

export default async function PublicSiteLayout({
  children,
}: {
  children: ReactNode;
}) {
  const org = await getOrganizationProfile();

  return (
    <div className="public-site flex min-h-dvh flex-col bg-public-cream text-public-ink">
      <a
        href="#konten-publik"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-public-forest focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-public-cream"
      >
        Lewati ke konten
      </a>
      <PublicHeader
        orgName={org?.org_name ?? "Karang Taruna"}
        dusunName={org?.dusun_name ?? "Dusun Tagog"}
      />
      <main id="konten-publik" className="flex-1">
        {children}
      </main>
      <PublicFooter org={org} />
    </div>
  );
}
