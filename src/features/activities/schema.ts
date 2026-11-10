import { z } from "zod";
import { wibInputToIso } from "@/lib/dates";

const editableStatusSchema = z.enum(["planned", "ongoing", "done"]);

const datetimeLocalSchema = z
  .string()
  .trim()
  .regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/,
    "Format tanggal dan waktu belum lengkap.",
  );

/**
 * Validasi form agenda. Nilai tanggal masih berupa string
 * <input type="datetime-local"> dalam WIB; konversi ke ISO dilakukan
 * di server action.
 */
export const activityFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Nama kegiatan minimal 3 karakter.")
      .max(160, "Nama kegiatan maksimal 160 karakter."),
    description: z
      .string()
      .trim()
      .max(2000, "Deskripsi maksimal 2000 karakter.")
      .nullable(),
    location: z
      .string()
      .trim()
      .max(200, "Lokasi maksimal 200 karakter.")
      .nullable(),
    startsAt: datetimeLocalSchema,
    endsAt: z.union([datetimeLocalSchema, z.literal("")]).nullable(),
    status: editableStatusSchema,
    isPublic: z.boolean(),
  })
  .superRefine((data, ctx) => {
    const startsAt = wibInputToIso(data.startsAt);
    if (!startsAt) {
      ctx.addIssue({
        code: "custom",
        path: ["startsAt"],
        message: "Waktu mulai belum valid.",
      });
      return;
    }

    if (!data.endsAt) return;

    const endsAt = wibInputToIso(data.endsAt);
    if (!endsAt) {
      ctx.addIssue({
        code: "custom",
        path: ["endsAt"],
        message: "Waktu selesai belum valid.",
      });
      return;
    }

    if (endsAt < startsAt) {
      ctx.addIssue({
        code: "custom",
        path: ["endsAt"],
        message: "Waktu selesai tidak boleh lebih awal dari waktu mulai.",
      });
    }
  });

export type ActivityFormValues = z.infer<typeof activityFormSchema>;
