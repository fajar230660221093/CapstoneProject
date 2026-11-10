import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

/**
 * Peringatan: fungsi ini berjalan di proxy (batas jaringan), sehingga tidak
 * boleh mengandalkan modul bersama atau state global.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getClaims() memverifikasi tanda tangan token setiap kali dipanggil.
  // JANGAN pakai getSession() di server: token mentah tidak diverifikasi.
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const isLoggedIn = Boolean(claims?.sub);
  const { pathname, search } = request.nextUrl;

  // Halaman yang boleh dibuka tanpa login.
  const isPublicRoute =
    pathname === "/" ||
    pathname === "/masuk" ||
    pathname === "/tentang" ||
    pathname === "/agenda" ||
    pathname === "/transparansi" ||
    pathname === "/kontak" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.startsWith("/bagikan/");

  if (!isLoggedIn && !isPublicRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/masuk";
    redirectUrl.search = "";
    redirectUrl.searchParams.set("redirectTo", `${pathname}${search}`);
    return NextResponse.redirect(redirectUrl);
  }

  if (isLoggedIn && pathname === "/masuk") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dasbor";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
