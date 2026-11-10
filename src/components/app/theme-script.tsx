"use client";

import { THEME_STORAGE_KEY } from "./theme-provider";

/**
 * Skrip kecil yang dijalankan browser saat HTML mulai diparse, sebelum
 * halaman pertama kali dilukis. Tujuannya mencegah kedipan tema terang di
 * awal muat halaman bagi pengguna yang memilih mode gelap.
 *
 * Catatan penting (lihat panduan Next.js "Preventing Flash Before Hydration"):
 * React 19 memperingatkan setiap `<script>` yang dirender dari Client
 * Component. Karena itu, di server tipe skrip dibuat `text/javascript` agar
 * dieksekusi browser, sedangkan saat render di client tipenya diganti
 * `text/plain` supaya tidak dieksekusi ulang dan tidak memicu peringatan.
 * `suppressHydrationWarning` menangani perbedaan atribut `type` tersebut.
 */
const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});var d=document.documentElement;var dark=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);d.classList.toggle("dark",dark);d.style.colorScheme=dark?"dark":"light"}catch(e){}})()`;

export function ThemeScript() {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
    />
  );
}
