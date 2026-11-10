import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "cn";

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  /** Warna aksen: netral, hijau (pemasukan), atau merah (pengeluaran). */
  tone?: "default" | "positive" | "negative";
  hint?: ReactNode;
}

const TONE_STYLES = {
  default: {
    icon: "bg-primary/10 text-primary",
    value: "text-foreground",
  },
  positive: {
    icon: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
    value: "text-emerald-600 dark:text-emerald-400",
  },
  negative: {
    icon: "bg-destructive/10 text-destructive",
    value: "text-destructive",
  },
} as const;

/**
 * Kartu statistik (saldo, pemasukan, pengeluaran).
 *
 * Aksen warna memakai warna semitransparan pada ikon saja, bukan pada
 * seluruh kartu, supaya tetap ringan dirender.
 */
export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
  hint,
}: StatCardProps) {
  const styles = TONE_STYLES[tone];

  return (
    <div className="group/stat relative overflow-hidden rounded-xl border bg-card p-4 shadow-xs transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        {Icon ? (
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-lg",
              styles.icon,
            )}
          >
            <Icon className="size-4" aria-hidden />
          </span>
        ) : null}
      </div>
      <p
        className={cn(
          "mt-2 font-heading text-2xl font-semibold tracking-tight",
          styles.value,
        )}
      >
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
