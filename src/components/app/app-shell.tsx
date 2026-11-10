import Link from "next/link";
import type { ReactNode } from "react";
import { TopBar } from "./top-bar";
import { SideNav } from "./side-nav";
import { BottomNav } from "./bottom-nav";
import type { AuthenticatedUser } from "@/features/auth/session";

interface AppShellProps {
  user: AuthenticatedUser;
  children: ReactNode;
}

export function AppShell({ user, children }: AppShellProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-muted/40">
      <TopBar user={user} />

      <div className="flex flex-1">
        <SideNav role={user.profile.role} />

        <main className="min-w-0 flex-1 pb-24 lg:pb-10">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>

      <BottomNav role={user.profile.role} />

      <footer className="hidden border-t bg-background px-4 py-5 text-center text-xs text-muted-foreground lg:block">
        <p>
          <Link href="/dasbor" className="font-medium hover:text-foreground">
            SIM Karang Taruna Dusun Tagog
          </Link>
          <span className="mx-2 text-border">|</span>
          <span>Dusun Tagog</span>
          <span className="mx-2 text-border">|</span>
          <Link href="/" className="font-medium hover:text-foreground">
            Halaman publik
          </Link>
        </p>
      </footer>
    </div>
  );
}
