import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

/**
 * Geist Sans - body & UI. Sudah terunduh di build, self-hosted, variable font
 * (satu file woff2 untuk semua bobot).
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

/** Geist Mono - angka tabular, kode, dan data teknis. */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

/** Plus Jakarta Sans - heading. Karakter tegas & modern, variable font. */
const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "SIM Karang Taruna Dusun Tagog",
    template: "%s | SIM Karang Taruna Dusun Tagog",
  },
  description:
    "Sistem Informasi Manajemen Kegiatan dan Administrasi Karang Taruna Dusun Tagog.",
  applicationName: "SIM Karang Taruna Dusun Tagog",
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Karang Taruna Dusun Tagog",
    title: "Karang Taruna Dusun Tagog",
    description:
      "Agenda kegiatan dan laporan kas Karang Taruna Dusun Tagog, terbuka untuk warga.",
    images: [{ url: "/logo.png", width: 834, height: 834, alt: "Logo Karang Taruna Dusun Tagog" }],
  },
  icons: {
    icon: [{ url: "/logo.png", type: "image/png" }],
    shortcut: "/logo.png",
    apple: [{ url: "/logo.png", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1512" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} ${jakartaSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background font-sans text-foreground">
        {children}
      </body>
    </html>
  );
}
