"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/app/brand-logo";
import { PublicLinkButton } from "@/components/public/public-button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/tentang", label: "Tentang" },
  { href: "/agenda", label: "Agenda" },
  { href: "/transparansi", label: "Transparansi" },
  { href: "/kontak", label: "Kontak" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface PublicHeaderProps {
  orgName: string;
  dusunName: string;
}

export function PublicHeader({ orgName, dusunName }: PublicHeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-public-forest/10 bg-public-cream/90 backdrop-blur-md">
      <div className="mx-auto flex h-18 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-3 rounded-full outline-none transition-opacity hover:opacity-85 focus-visible:ring-2 focus-visible:ring-public-leaf/50"
          onClick={() => setOpen(false)}
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white p-1.5 ring-1 ring-public-forest/10 shadow-sm">
            <BrandLogo />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-heading text-sm font-semibold leading-tight text-public-ink sm:text-base">
              {orgName}
            </span>
            <span className="block truncate text-[11px] font-medium uppercase tracking-[0.16em] text-public-muted">
              {dusunName}
            </span>
          </span>
        </Link>

        <nav
          aria-label="Navigasi situs"
          className="hidden items-center gap-1 lg:flex"
        >
          {NAV_LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-public-forest/10 text-public-forest"
                    : "text-public-muted hover:bg-public-forest/5 hover:text-public-ink",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <PublicLinkButton
            href="/masuk"
            variant="secondary"
            className="hidden h-10 px-4 sm:inline-flex"
          >
            Masuk Pengurus
          </PublicLinkButton>

          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-full border border-public-forest/15 bg-white/70 text-public-forest outline-none transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-public-leaf/50 lg:hidden"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
            aria-controls="menu-publik"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div
          id="menu-publik"
          className="border-t border-public-forest/10 bg-public-cream px-4 pb-5 pt-3 shadow-lg shadow-public-forest/5 lg:hidden"
        >
          <nav aria-label="Navigasi situs ponsel" className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                    active
                      ? "bg-public-forest/10 text-public-forest"
                      : "text-public-muted hover:bg-public-forest/5 hover:text-public-ink",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <PublicLinkButton
            href="/masuk"
            variant="primary"
            className="mt-4 w-full"
            onClick={() => setOpen(false)}
          >
            Masuk Pengurus
          </PublicLinkButton>
        </div>
      ) : null}
    </header>
  );
}
