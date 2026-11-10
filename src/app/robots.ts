import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dasbor",
          "/kas",
          "/arsip",
          "/profil",
          "/aktivitas",
          "/kelola",
          "/pengaturan",
          "/masuk",
          "/api",
        ],
      },
    ],
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
