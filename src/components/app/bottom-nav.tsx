"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getPrimaryNavItems, isActivePath } from "./navigation";
import type { AppRole } from "@/types/database";

export function BottomNav({ role }: { role: AppRole }) {
  const pathname = usePathname();
  const items = getPrimaryNavItems(role);

  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 lg:hidden"
    >
      <ul
        className="grid"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map((item) => {
          const active = isActivePath(pathname, item.href);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex flex-col items-center gap-1 px-1 pb-2 pt-2.5 text-[11px] font-medium transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {active ? (
                  <span
                    className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-primary"
                    aria-hidden
                  />
                ) : null}
                <Icon
                  className="size-5"
                  aria-hidden
                  strokeWidth={active ? 2.4 : 1.9}
                />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
