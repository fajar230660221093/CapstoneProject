import type { AppRole, ProfileRow } from "@/types/database";

export interface AuthenticatedUser {
  id: string;
  email: string | null;
  profile: ProfileRow;
}

/** Boleh menulis data keuangan? (cerminan aturan RLS, untuk penyembunyian tombol) */
export function canManageFinance(role: AppRole): boolean {
  return role === "treasurer";
}

/** Boleh melihat data keuangan? */
export function canViewFinance(role: AppRole): boolean {
  return role === "treasurer" || role === "chairman";
}

/** Boleh mengarsipkan dokumen / mengelola periode? */
export function canManageArchive(role: AppRole): boolean {
  return role === "chairman";
}

/** Boleh mengunggah berkas? */
export function canUploadDocuments(role: AppRole): boolean {
  return role === "chairman" || role === "treasurer" || role === "manager";
}

/** Label peran dalam bahasa Indonesia. */
export const ROLE_LABELS: Record<AppRole, string> = {
  chairman: "Ketua",
  treasurer: "Bendahara",
  manager: "Pengurus",
};
