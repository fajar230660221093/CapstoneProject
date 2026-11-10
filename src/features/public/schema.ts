import { z } from "zod";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const optionalUrl = z
  .string()
  .trim()
  .max(300, "URL maksimal 300 karakter.")
  .refine(
    (value) => !value || /^https?:\/\/.+/i.test(value),
    "URL harus diawali http:// atau https://.",
  );

/** Validasi konten halaman publik yang diisi Ketua. */
export const publicSiteSchema = z.object({
  orgName: z
    .string()
    .trim()
    .min(2, "Nama organisasi minimal 2 karakter.")
    .max(120, "Nama organisasi maksimal 120 karakter."),
  dusunName: z
    .string()
    .trim()
    .min(2, "Nama dusun minimal 2 karakter.")
    .max(120, "Nama dusun maksimal 120 karakter."),
  address: z.string().trim().max(500, "Alamat maksimal 500 karakter."),
  tagline: z.string().trim().max(200, "Tagline maksimal 200 karakter."),
  aboutText: z.string().trim().max(3000, "Tentang maksimal 3000 karakter."),
  vision: z.string().trim().max(1000, "Visi maksimal 1000 karakter."),
  mission: z.string().trim().max(2000, "Misi maksimal 2000 karakter."),
  contactPhone: z
    .string()
    .trim()
    .max(40, "Nomor telepon maksimal 40 karakter."),
  contactEmail: z
    .string()
    .trim()
    .max(160, "Email maksimal 160 karakter.")
    .refine(
      (value) => !value || emailPattern.test(value),
      "Format email belum benar.",
    ),
  instagramUrl: optionalUrl,
  facebookUrl: optionalUrl,
  mapsUrl: optionalUrl,
});

export type PublicSiteFormValues = z.infer<typeof publicSiteSchema>;
