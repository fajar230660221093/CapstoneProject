import { cache } from "react";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { PERIOD_COOKIE } from "./constants";
import type { PeriodRow } from "@/types/database";

/**
 * Daftar seluruh periode, terbaru lebih dulu.
 *
 * Di-cache per request: hampir setiap halaman memanggil `listPeriods()` dan
 * `getSelectedPeriod()` sekaligus, dan `getSelectedPeriod()` sendiri butuh
 * daftar periode. Tanpa cache, daftar periode diambil dua kali per navigasi.
 */
export const listPeriods = cache(async (): Promise<PeriodRow[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("periods")
    .select("*")
    .order("start_year", { ascending: false });

  if (error) throw new Error(`Gagal memuat periode: ${error.message}`);
  return data ?? [];
});

/**
 * Periode yang sedang dipilih pengguna.
 * Disimpan di cookie agar tetap konsisten antar halaman dan setelah reload.
 */
export async function getSelectedPeriod(): Promise<PeriodRow | null> {
  const periods = await listPeriods();
  if (periods.length === 0) return null;

  const store = await cookies();
  const selectedId = store.get(PERIOD_COOKIE)?.value;

  if (selectedId) {
    const found = periods.find((period) => period.id === selectedId);
    if (found) return found;
  }

  return periods.find((period) => period.status === "active") ?? periods[0];
}
