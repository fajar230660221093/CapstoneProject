"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { PERIOD_COOKIE } from "./constants";

/** Ganti periode terpilih. */
export async function selectPeriod(periodId: string): Promise<void> {
  const store = await cookies();
  store.set(PERIOD_COOKIE, periodId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  revalidatePath("/", "layout");
}

/** Buat periode baru (hanya Ketua - RLS juga menolak peran lain). */
export async function createPeriod(input: {
  name: string;
  startYear: number;
  endYear: number;
  duesAmount: number | null;
}): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase.from("periods").insert({
    name: input.name,
    start_year: input.startYear,
    end_year: input.endYear,
    dues_amount: input.duesAmount,
    status: "active",
  });

  if (error) {
    if (error.message.includes("periods_single_active")) {
      return {
        error:
          "Hanya boleh ada satu periode aktif. Arsipkan periode lama lebih dulu.",
      };
    }
    return { error: `Gagal membuat periode: ${error.message}` };
  }

  revalidatePath("/", "layout");
  return {};
}

/** Arsipkan periode aktif (hanya Ketua). */
export async function archivePeriod(periodId: string): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("periods")
    .update({ status: "archived", closed_at: new Date().toISOString() })
    .eq("id", periodId);

  if (error) {
    return { error: `Gagal mengarsipkan periode: ${error.message}` };
  }

  revalidatePath("/", "layout");
  return {};
}
