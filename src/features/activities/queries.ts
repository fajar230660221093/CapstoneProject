import { createClient } from "@/lib/supabase/server";
import type { ActivityRow } from "@/types/database";

/** Seluruh agenda untuk halaman pengurus (termasuk yang belum publik). */
export async function listActivitiesForBoard(): Promise<ActivityRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .order("starts_at", { ascending: false });

  if (error) throw new Error(`Gagal memuat agenda: ${error.message}`);
  return data ?? [];
}

/** Satu agenda untuk halaman edit. */
export async function getActivity(id: string): Promise<ActivityRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Gagal memuat agenda: ${error.message}`);
  return data;
}
