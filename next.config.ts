import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  // Izinkan akses dari jaringan lokal (mis. membuka app dari HP di WiFi
  // yang sama) tanpa peringatan dev server.
  allowedDevOrigins: ["192.168.18.5"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  /**
   * `exceljs` (~21 MB) hanya dipakai di sisi server (route import-preview),
   * sehingga tidak ikut di-bundle oleh Next.js.
   * `@react-pdf/renderer` sudah otomatis di-external oleh Next.js.
   */
  serverExternalPackages: ["exceljs"],
};

export default nextConfig;
