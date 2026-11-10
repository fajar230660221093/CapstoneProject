import {
  BarChart3,
  CalendarDays,
  FolderOpen,
  History,
  LayoutDashboard,
  Settings,
  Tags,
  Upload,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { AppRole } from "@/types/database";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Peran yang boleh membuka menu ini. */
  roles: AppRole[];
  /** Tampilkan di navigasi bawah pada ponsel. */
  primary?: boolean;
}

const SEMUA: AppRole[] = ["chairman", "treasurer", "manager"];
const KEUANGAN: AppRole[] = ["chairman", "treasurer"];
const KELOLA: AppRole[] = ["chairman", "treasurer"];

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/dasbor",
    label: "Dasbor",
    icon: LayoutDashboard,
    roles: SEMUA,
    primary: true,
  },
  {
    href: "/arsip",
    label: "Arsip",
    icon: FolderOpen,
    roles: SEMUA,
    primary: true,
  },
  {
    href: "/kas",
    label: "Kas",
    icon: Wallet,
    roles: KEUANGAN,
    primary: true,
  },
  {
    href: "/kas/rekap",
    label: "Rekap",
    icon: BarChart3,
    roles: KEUANGAN,
    primary: true,
  },
  {
    href: "/kelola/agenda",
    label: "Agenda",
    icon: CalendarDays,
    roles: SEMUA,
    primary: true,
  },
  {
    href: "/kas/kategori",
    label: "Kategori",
    icon: Tags,
    roles: KELOLA,
  },
  {
    href: "/kas/impor",
    label: "Impor Kas",
    icon: Upload,
    roles: ["treasurer"],
  },
  {
    href: "/aktivitas",
    label: "Log Aktivitas",
    icon: History,
    roles: KEUANGAN,
  },
  {
    href: "/pengaturan/publik",
    label: "Pengaturan Publik",
    icon: Settings,
    roles: ["chairman"],
  },
];

/** Menu yang bisa diakses pengguna dengan peran tertentu. */
export function getNavItems(role: AppRole): NavItem[] {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}

/** Menu utama untuk navigasi bawah ponsel (maksimal 5). */
export function getPrimaryNavItems(role: AppRole): NavItem[] {
  return getNavItems(role)
    .filter((item) => item.primary)
    .slice(0, 5);
}

/** Apakah path aktif (untuk menyorot menu). */
export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/dasbor") return pathname === "/dasbor";
  return pathname === href || pathname.startsWith(`${href}/`);
}
