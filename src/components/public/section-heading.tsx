import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "left",
  className,
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        centered && "sm:flex-col sm:items-center",
        className,
      )}
    >
      <div className={cn("min-w-0", centered && "mx-auto max-w-2xl text-center")}>
        {eyebrow ? (
          <p
            className={cn(
              "flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-public-leaf",
              centered && "justify-center",
            )}
          >
            <span className="h-px w-6 bg-public-leaf/50" />
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-public-ink sm:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-public-muted sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
