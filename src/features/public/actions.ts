"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/features/auth/session";
import {
  publicSiteSchema,
  type PublicSiteFormValues,
} from "@/features/public/schema";

export interface PublicSiteActionResult {
  ok: boolean;
  error?: string;
}

function emptyToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/**
 * Simpan konten halaman publik.
 * Hanya Ketua yang boleh; RLS `organization_profiles` juga menegakkan aturan
 * yang sama di database.
 */
export async function updatePublicSiteContent(
  input: PublicSiteFormValues,
): Promise<PublicSiteActionResult> {
  await requireRole(["chairman"]);

  const parsed = publicSiteSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Data belum benar.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("organization_profiles")
    .update({
      org_name: parsed.data.orgName.trim(),
      dusun_name: parsed.data.dusunName.trim(),
      address: emptyToNull(parsed.data.address),
      tagline: emptyToNull(parsed.data.tagline),
      about_text: emptyToNull(parsed.data.aboutText),
      vision: emptyToNull(parsed.data.vision),
      mission: emptyToNull(parsed.data.mission),
      contact_phone: emptyToNull(parsed.data.contactPhone),
      contact_email: emptyToNull(parsed.data.contactEmail),
      instagram_url: emptyToNull(parsed.data.instagramUrl),
      facebook_url: emptyToNull(parsed.data.facebookUrl),
      maps_url: emptyToNull(parsed.data.mapsUrl),
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) {
    return { ok: false, error: `Gagal menyimpan: ${error.message}` };
  }

  revalidatePath("/");
  revalidatePath("/tentang");
  revalidatePath("/agenda");
  revalidatePath("/transparansi");
  revalidatePath("/kontak");
  revalidatePath("/pengaturan/publik");

  return { ok: true };
}
