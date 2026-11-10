"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/features/auth/session";
import { wibInputToIso } from "@/lib/dates";
import {
  activityFormSchema,
  type ActivityFormValues,
} from "@/features/activities/schema";

export interface ActivityActionResult {
  ok: boolean;
  error?: string;
  id?: string;
}

function revalidateActivityPages(id?: string) {
  revalidatePath("/");
  revalidatePath("/agenda");
  revalidatePath("/kelola/agenda");
  if (id) revalidatePath(`/kelola/agenda/${id}`);
}

function buildPayload(data: ActivityFormValues) {
  const startsAt = wibInputToIso(data.startsAt);
  const endsAt = data.endsAt ? wibInputToIso(data.endsAt) : null;

  if (!startsAt) return null;

  return {
    title: data.title.trim(),
    description: data.description?.trim() || null,
    location: data.location?.trim() || null,
    starts_at: startsAt,
    ends_at: endsAt,
    status: data.status,
    is_public: data.isPublic,
  };
}

/** Buat agenda baru. RLS memastikan hanya pengurus aktif yang bisa menulis. */
export async function createActivity(
  input: ActivityFormValues,
): Promise<ActivityActionResult> {
  const user = await requireUser();

  const parsed = activityFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Data agenda belum benar.",
    };
  }

  const payload = buildPayload(parsed.data);
  if (!payload) {
    return { ok: false, error: "Waktu mulai belum valid." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activities")
    .insert({ ...payload, created_by: user.id })
    .select("id")
    .single();

  if (error) {
    return { ok: false, error: `Gagal menyimpan agenda: ${error.message}` };
  }

  revalidateActivityPages(data.id);
  return { ok: true, id: data.id };
}

/** Perbarui agenda yang sudah ada. */
export async function updateActivity(
  id: string,
  input: ActivityFormValues,
): Promise<ActivityActionResult> {
  await requireUser();

  const parsed = activityFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Data agenda belum benar.",
    };
  }

  const payload = buildPayload(parsed.data);
  if (!payload) {
    return { ok: false, error: "Waktu mulai belum valid." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activities")
    .update(payload)
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    return { ok: false, error: `Gagal memperbarui agenda: ${error.message}` };
  }

  if (!data) {
    return { ok: false, error: "Agenda tidak ditemukan." };
  }

  revalidateActivityPages(id);
  return { ok: true, id };
}

/** Batalkan agenda tanpa menghapus data. */
export async function cancelActivity(
  id: string,
): Promise<ActivityActionResult> {
  await requireUser();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activities")
    .update({ status: "cancelled" })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    return { ok: false, error: `Gagal membatalkan agenda: ${error.message}` };
  }

  if (!data) {
    return { ok: false, error: "Agenda tidak ditemukan." };
  }

  revalidateActivityPages(id);
  return { ok: true, id };
}

/** Pulihkan agenda yang dibatalkan menjadi "direncanakan". */
export async function restoreActivity(
  id: string,
): Promise<ActivityActionResult> {
  await requireUser();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activities")
    .update({ status: "planned" })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    return { ok: false, error: `Gagal memulihkan agenda: ${error.message}` };
  }

  if (!data) {
    return { ok: false, error: "Agenda tidak ditemukan." };
  }

  revalidateActivityPages(id);
  return { ok: true, id };
}
