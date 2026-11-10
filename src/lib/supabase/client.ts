import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/**
 * Klien Supabase untuk komponen Client Component.
 * Sengaja tidak diekspor di modul lain supaya tidak dipakai di server.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
