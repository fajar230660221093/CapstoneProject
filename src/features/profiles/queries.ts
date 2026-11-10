import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/types/database";

/**
 * Daftar seluruh anggota organisasi.
 */
export async function listMembers(): Promise<ProfileRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("full_name", { ascending: true });

  if (error) throw new Error(`Gagal memuat anggota: ${error.message}`);
  return data ?? [];
}

/**
 * Daftar anggota untuk keperluan lookup nama (mis. penginput transaksi).
 *
 * Di-cache dengan `cache()` React sehingga seluruh query yang butuh lookup
 * nama dalam satu request hanya memanggil database SATU kali. Sebelumnya
 * tiap fitur memanggilnya sendiri ( transaksi, arsip, log aktivitas ),
 * menambah beberapa round-trip ke Supabase di setiap navigasi.
 */
export const listProfiles = cache(async (): Promise<ProfileRow[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("full_name", { ascending: true });

  if (error) throw new Error(`Gagal memuat anggota: ${error.message}`);
  return data ?? [];
});
