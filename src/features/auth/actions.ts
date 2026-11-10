"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "./schema";

export interface AuthState {
  error?: string;
}

/**
 * Masuk ke aplikasi.
 * Pesan error sengaja ditulis dalam bahasa Indonesia yang ramah.
 */
export async function signIn(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Data belum lengkap.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("invalid login")) {
      return { error: "Email atau sandi salah. Silakan coba lagi." };
    }
    if (message.includes("email not confirmed")) {
      return {
        error:
          "Akun belum diaktifkan. Hubungi Ketua untuk membantu mengaktifkan akun.",
      };
    }
    return { error: "Gagal masuk. Silakan coba lagi beberapa saat lagi." };
  }

  const redirectTo = formData.get("redirectTo");
  const target =
    typeof redirectTo === "string" && redirectTo.startsWith("/")
      ? redirectTo
      : "/dasbor";

  redirect(target);
}

/** Keluar dari aplikasi. */
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/masuk");
}
