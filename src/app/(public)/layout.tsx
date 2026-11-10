import type { Viewport } from "next";
import type { ReactNode } from "react";
import { PublicThemeGuard } from "@/components/public/public-theme-guard";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#f8f3e3",
};

/**
 * Semua halaman yang bisa diakses tanpa login selalu terang, termasuk
 * halaman /masuk. Aplikasi internal tetap memakai ThemeProvider sendiri.
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PublicThemeGuard />
      {children}
    </>
  );
}
