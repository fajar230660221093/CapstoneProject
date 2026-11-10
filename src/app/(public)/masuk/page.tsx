import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";
import { BrandLogo } from "@/components/app/brand-logo";
import { getCurrentUser } from "@/features/auth/session";

export const metadata: Metadata = {
  title: "Masuk",
};

export default async function MasukPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/dasbor");

  const params = await searchParams;
  const redirectTo =
    typeof params.redirectTo === "string" && params.redirectTo.startsWith("/")
      ? params.redirectTo
      : "/dasbor";

  return (
    <main className="relative flex min-h-dvh flex-col justify-center px-4 py-10">
      {/* Gradien dekoratif murni CSS supaya tidak ada aset gambar yang
          perlu diunduh (app harus tetap ringan di laptop tua). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60rem_40rem_at_50%_-10%,var(--color-primary)/12%,transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-muted/40"
      />

      <div className="mx-auto w-full max-w-sm">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-white p-1.5 shadow-lg shadow-primary/20 ring-1 ring-black/5">
            <BrandLogo preload />
          </div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            SIM Karang Taruna
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Dusun Tagog · Kelola arsip dan keuangan organisasi.
          </p>
        </div>

        <LoginForm redirectTo={redirectTo} />

        <p className="mt-7 text-center text-xs text-muted-foreground">
          Belum punya akun? Hubungi Ketua Karang Taruna untuk membuat akun.
        </p>
      </div>
    </main>
  );
}
