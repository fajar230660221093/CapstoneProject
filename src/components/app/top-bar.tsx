"use client";

import Link from "next/link";
import { ChevronDown, LogOut, UserRound } from "lucide-react";
import { signOut } from "@/features/auth/actions";
import { ROLE_LABELS } from "@/features/auth/roles";
import type { AuthenticatedUser } from "@/features/auth/roles";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "./brand-logo";
import { ThemeToggle } from "./theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TopBar({ user }: { user: AuthenticatedUser }) {
  const name = user.profile.full_name || user.email || "Anggota";

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="flex h-16 items-center justify-between gap-3 px-4 lg:px-8">
        <Link
          href="/dasbor"
          className="flex min-w-0 items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white p-0.5 ring-1 ring-black/10">
            <BrandLogo />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate font-heading text-sm font-semibold tracking-tight">
              Karang Taruna Tagog
            </span>
            <span className="hidden truncate text-xs text-muted-foreground sm:block">
              Dusun Tagog &middot; SIM Karang Taruna
            </span>
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-1">
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 gap-2 px-2">
                <span className="max-w-28 truncate text-sm">{name}</span>
                <ChevronDown className="size-4 opacity-60" aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex flex-col gap-0.5">
                <span className="truncate text-sm font-medium">{name}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {ROLE_LABELS[user.profile.role]}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profil" className="flex items-center gap-2">
                  <UserRound className="size-4" aria-hidden />
                  Profil saya
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2 text-left"
                  >
                    <LogOut className="size-4" aria-hidden />
                    Keluar
                  </button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
