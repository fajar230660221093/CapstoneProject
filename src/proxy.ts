import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

/**
 * Proxy Next.js 16 (menggantikan middleware.ts).
 *
 * Tugasnya satu: menyegarkan sesi login di setiap request dan mengarahkan
 * pengguna yang belum login ke halaman /masuk.
 *
 * Catatan: di Next.js 15 ke bawah file ini bernama middleware.ts dan TIDAK
 * pernah dipanggil untuk penyegaran sesi -> pengguna terlogout acak.
 */
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|xml|txt|webmanifest)$).*)",
  ],
};
