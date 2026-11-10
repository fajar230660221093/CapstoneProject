"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Pengelola tema terang/gelap untuk aplikasi internal.
 *
 * Implementasi ini menggantikan `next-themes`. Alasannya: next-themes
 * merender `<script>` di dalam Client Component, dan React 19 memperingatkan
 * hal itu di console (berlaku juga di Next.js 16) padahal skrip tersebut
 * memang dibutuhkan untuk mencegah kedipan tema saat halaman dimuat.
 *
 * Di sini skrip awal dipisah ke `ThemeScript` dan hanya dirender di server,
 * sedangkan komponen ini fokus menyimpan pilihan dan menempelkan kelas
 * `.dark` ke elemen `<html>`.
 */

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";

const MEDIA_QUERY = "(prefers-color-scheme: dark)";
const THEMES: Theme[] = ["light", "dark", "system"];

interface ThemeContextValue {
  /** Pilihan pengguna: terang, gelap, atau ikuti sistem. */
  theme: Theme;
  /** Tema yang benar-benar dipakai (`system` sudah diterjemahkan). */
  resolvedTheme: ResolvedTheme;
  /** Preferensi perangkat saat ini. */
  systemTheme: ResolvedTheme;
  themes: Theme[];
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** `useLayoutEffect` di browser, `useEffect` saat render server. */
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark" || value === "system";
}

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia(MEDIA_QUERY).matches ? "dark" : "light";
}

function readStoredTheme(): Theme | null {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(value) ? value : null;
  } catch {
    // localStorage bisa diblokir (mode privat / kebijakan browser).
    return null;
  }
}

/** Tempelkan tema ke `<html>`; kelas `dark` mengaktifkan token warna gelap. */
function applyTheme(resolved: ResolvedTheme) {
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;
}

/**
 * Matikan transisi CSS sesaat supaya pergantian tema tidak berkedip,
 * lalu kembalikan lagi setelah browser menghitung ulang gaya.
 */
function withoutTransitions(callback: () => void) {
  const style = document.createElement("style");
  style.appendChild(
    document.createTextNode(
      "*,*::before,*::after{-webkit-transition:none!important;transition:none!important}",
    ),
  );
  document.head.appendChild(style);
  try {
    callback();
    // Paksa browser memakai gaya tanpa transisi sebelum dilepas.
    void window.getComputedStyle(document.body).opacity;
  } finally {
    window.setTimeout(() => style.remove(), 1);
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Nilai awal dibaca dari localStorage di browser supaya state React
  // langsung cocok dengan kelas yang sudah dipasang `ThemeScript`.
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "system";
    return readStoredTheme() ?? "system";
  });
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() => {
    if (typeof window === "undefined") return "light";
    return getSystemTheme();
  });

  const resolvedTheme: ResolvedTheme =
    theme === "system" ? systemTheme : theme;

  // Dipakai juga untuk memulihkan kelas `dark` yang dihapus React Strict
  // Mode saat remount di mode pengembangan.
  useIsomorphicLayoutEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  // Ikuti perubahan preferensi sistem selama pengguna memilih "system".
  useEffect(() => {
    const media = window.matchMedia(MEDIA_QUERY);
    const handleChange = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? "dark" : "light");
    };

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  // Samakan tema antar-tab saat pengguna mengganti pilihan di tab lain.
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) return;
      if (isTheme(event.newValue)) setThemeState(event.newValue);
      else setThemeState("system");
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    const resolved = next === "system" ? getSystemTheme() : next;
    withoutTransitions(() => applyTheme(resolved));
    setThemeState(next);

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Pilihan tetap berlaku untuk sesi ini walau gagal disimpan.
    }
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      systemTheme,
      themes: THEMES,
      setTheme,
    }),
    [theme, resolvedTheme, systemTheme, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/**
 * Di luar `ThemeProvider` (mis. halaman publik) tema dianggap terang,
 * sehingga pemanggil tidak perlu menambahkan pengecekan khusus.
 */
const FALLBACK: ThemeContextValue = {
  theme: "light",
  resolvedTheme: "light",
  systemTheme: "light",
  themes: THEMES,
  setTheme: () => {},
};

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext) ?? FALLBACK;
}
