"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/app/error-state";

/**
 * Error boundary untuk route group (app).
 *
 * Tanpa ini, kegagalan query ke database akan menampilkan halaman error
 * mentah dari Next.js. Sekarang user melihat pesan ramah plus tombol coba lagi.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorState
      title="Gagal memuat halaman"
      description="Terjadi masalah saat mengambil data dari server. Periksa koneksi internet Anda lalu coba muat ulang halaman ini."
      onRetry={reset}
    />
  );
}
