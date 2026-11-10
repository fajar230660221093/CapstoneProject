import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

/**
 * Klien Supabase untuk Server Component, Server Action, dan Route Handler.
 *
 * PENTING: fungsi ini harus dipanggil di dalam request (bukan di level modul),
 * karena cookie store hanya valid selama request berjalan.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Di Server Component cookie tidak bisa ditulis.
            // Penulisan cookie sesi ditangani oleh proxy.ts.
          }
        },
      },
    },
  );
}
