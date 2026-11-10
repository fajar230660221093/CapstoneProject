import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AppRole } from "@/types/database";
import type { AuthenticatedUser } from "@/features/auth/roles";

export type { AuthenticatedUser } from "@/features/auth/roles";
export {
  canManageArchive,
  canManageFinance,
  canUploadDocuments,
  canViewFinance,
  ROLE_LABELS,
} from "@/features/auth/roles";

/**
 * Ambil pengguna yang sedang login beserta profilnya.
 * Mengembalikan null bila tidak login atau profilnya sudah dinonaktifkan.
 *
 * Di-cache per request: layout aplikasi dan setiap halaman memanggilnya,
 * tanpa cache ini session di-verify dua kali per navigasi.
 */
export const getCurrentUser = cache(
  async (): Promise<AuthenticatedUser | null> => {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.getClaims();

    if (error || !data?.claims?.sub) return null;

    const userId = data.claims.sub;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (!profile || !profile.is_active) return null;

    return {
      id: userId,
      email:
        typeof data.claims.email === "string" ? data.claims.email : null,
      profile,
    };
  },
);

/** Sama seperti getCurrentUser, tetapi mengarahkan ke /masuk bila belum login. */
export async function requireUser(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/masuk");
  return user;
}

/**
 * Pastikan pengguna punya salah satu dari peran yang diizinkan.
 * PENTING: ini lapisan kedua. Aturan sebenarnya ditegakkan RLS di database.
 */
export async function requireRole(roles: AppRole[]): Promise<AuthenticatedUser> {
  const user = await requireUser();
  if (!roles.includes(user.profile.role)) redirect("/dasbor");
  return user;
}
