/** Basis URL situs. Dipakai metadata, sitemap, dan robots. */
export function getSiteUrl(): string {
  const raw = (
    process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL
  )?.trim();
  if (!raw) return "http://localhost:3000";

  try {
    return new URL(raw).origin;
  } catch {
    return "http://localhost:3000";
  }
}
