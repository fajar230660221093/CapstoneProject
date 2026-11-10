import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email belum benar. Contoh: nama@email.com"),
  password: z.string().min(1, "Sandi wajib diisi"),
});

export type LoginValues = z.infer<typeof loginSchema>;
