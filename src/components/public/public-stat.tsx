import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type PublicStatTone = "forest" | "leaf" | "amber";

const TONES: Record<PublicStatTone, string> = {
  forest: "bg-public-forest/10 text-public-forest",
  leaf: "bg-public-leaf/15 text-public-forest",
  amber: "bg-public-amber/25 text-public-ink",
};

interface PublicStatProps {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: PublicStatTone;
  className?: string;
}

export function PublicStat({
  label,
  value,
  hint,
  icon: Icon,
  tone = "forest",
  className,
}: PublicStatProps) {
  const isNegative = value.trim().startsWith("-");

  return (
    <div
      className={cn(
        "rounded-3xl border border-public-forest/10 bg-white/70 p-5 shadow-[0_18px_60px_-42px_rgba(31,77,58,0.55)] backdrop-blur-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-public-muted">
          {label}
        </p>
        <span
          className={cn(
            "inline-flex size-9 items-center justify-center rounded-2xl",
            TONES[tone],
          )}
        >
          <Icon className="size-4" />
        </span>
      </div>
      <p
        className={cn(
          "mt-3 font-heading text-2xl font-semibold tracking-tight sm:text-3xl",
          isNegative ? "text-rose-700" : "text-public-ink",
        )}
      >
        {value}
      </p>
      {hint ? (
        <p className="mt-1.5 text-xs leading-relaxed text-public-muted">{hint}</p>
      ) : null}
    </div>
  );
}
