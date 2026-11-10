"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getNavItems, isActivePath } from "./navigation";
import type { AppRole } from "@/types/database";

export function SideNav({ role }: { role: AppRole }) {
  const pathname = usePathname();
  const items = getNavItems(role);

  if (items.length === 0) return null;

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-sidebar lg:block">
      <nav className="sticky top-16 max-h-[calc(100dvh-4rem)] overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          Menu
        </p>
        <ul className="space-y-1">
          {items.map((item) => {
            const active = isActivePath(pathname, item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
                  }`}
                >
                  {active ? (
                    <span
                      className="nav-active-indicator"
                      aria-hidden
                    />
                  ) : null}
                  <Icon
                    className={`size-4 shrink-0 transition-colors ${
                      active
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-foreground"
                    }`}
                    aria-hidden
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
