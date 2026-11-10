"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/features/auth/session";
import type { AppRole } from "@/types/database";

export interface ProfileActionResult {
  ok: boolean;
  error?: string;
}

/** Perbarui nama & telepon milik sendiri. */
export async function updateOwnProfile(input: {
  fullName: string;
  phone: string | null;
}): Promise<ProfileActionResult> {
  const user = await requireUser();

  const parsed = z
    .object({
      fullName: z.string().min(2, "Nama minimal 2 karakter.").max(120),
      phone: z.string().max(30).nullable(),
    })
    .safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Data belum benar.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName.trim(),
      phone: parsed.data.phone?.trim() ? parsed.data.phone.trim() : null,
    })
    .eq("id", user.id);

  if (error) {
    return { ok: false, error: `Gagal menyimpan profil: ${error.message}` };
  }

  revalidatePath("/profil");
  revalidatePath("/", "layout");

  return { ok: true };
}

/** Ubah peran anggota (hanya Ketua). */
export async function updateMemberRole(input: {
  userId: string;
  role: AppRole;
}): Promise<ProfileActionResult> {
  const user = await requireUser();

  if (user.profile.role !== "chairman") {
    return { ok: false, error: "Hanya Ketua yang boleh mengubah peran anggota." };
  }

  const parsed = z
    .object({ userId: z.uuid(), role: z.enum(["chairman", "treasurer", "manager"]) })
    .safeParse(input);

  if (!parsed.success) {
    return { ok: false, error: "Data peran belum benar." };
  }

  if (parsed.data.userId === user.id && parsed.data.role !== "chairman") {
    return {
      ok: false,
      error: "Anda tidak bisa menurunkan peran akun Anda sendiri.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role: parsed.data.role })
    .eq("id", parsed.data.userId);

  if (error) {
    return { ok: false, error: `Gagal mengubah peran: ${error.message}` };
  }

  revalidatePath("/profil");

  return { ok: true };
}

/** Aktifkan/nonaktifkan akun anggota (hanya Ketua). */
export async function updateMemberActive(input: {
  userId: string;
  isActive: boolean;
}): Promise<ProfileActionResult> {
  const user = await requireUser();

  if (user.profile.role !== "chairman") {
    return {
      ok: false,
      error: "Hanya Ketua yang boleh mengaktifkan/nonaktifkan akun.",
    };
  }

  const parsed = z
    .object({ userId: z.uuid(), isActive: z.boolean() })
    .safeParse(input);

  if (!parsed.success) {
    return { ok: false, error: "Data akun belum benar." };
  }

  if (parsed.data.userId === user.id && !parsed.data.isActive) {
    return { ok: false, error: "Anda tidak bisa menonaktifkan akun Anda sendiri." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ is_active: parsed.data.isActive })
    .eq("id", parsed.data.userId);

  if (error) {
    return { ok: false, error: `Gagal mengubah status akun: ${error.message}` };
  }

  revalidatePath("/profil");

  return { ok: true };
}
