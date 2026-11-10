import type { ReactNode } from "react";
import { AppShell } from "@/components/app/app-shell";
import { ThemeProvider } from "@/components/app/theme-provider";
import { ThemeScript } from "@/components/app/theme-script";
import { Toaster } from "@/components/ui/sonner";
import { requireUser } from "@/features/auth/session";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();

  return (
    <>
      {/* Dipasang sebelum konten agar tema tersimpan sudah aktif saat paint. */}
      <ThemeScript />
      <ThemeProvider>
        <AppShell user={user}>{children}</AppShell>
        <Toaster position="top-center" richColors closeButton />
      </ThemeProvider>
    </>
  );
}
