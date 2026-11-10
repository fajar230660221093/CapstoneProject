"use client";

import { useEffect, useLayoutEffect } from "react";

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Halaman publik selalu terang.
 *
 * ThemeProvider menempelkan kelas `dark` di <html> untuk aplikasi internal.
 * Kalau pengurus berpindah
 * dari aplikasi internal (mode gelap) ke halaman publik lewat navigasi client,
 * kelas itu bisa terbawa. Guard ini melepasnya sebelum paint. Saat pengguna
 * masuk kembali ke aplikasi internal, ThemeProvider memasang tema aktif lagi.
 */
export function PublicThemeGuard() {
  useIsomorphicLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark");
    root.style.colorScheme = "light";

    return () => {
      root.style.colorScheme = "";
    };
  }, []);

  return null;
}
