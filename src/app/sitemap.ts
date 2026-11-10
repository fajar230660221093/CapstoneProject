import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const now = new Date();

  const pages: Array<{
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  }> = [
    { path: "", changeFrequency: "weekly", priority: 1 },
    { path: "/agenda", changeFrequency: "weekly", priority: 0.9 },
    { path: "/transparansi", changeFrequency: "weekly", priority: 0.9 },
    { path: "/tentang", changeFrequency: "monthly", priority: 0.7 },
    { path: "/kontak", changeFrequency: "monthly", priority: 0.6 },
  ];

  return pages.map((page) => ({
    url: `${base}${page.path}`,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
