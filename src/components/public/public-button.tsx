import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type PublicButtonVariant = "primary" | "secondary" | "amber" | "ghost";

const VARIANTS: Record<PublicButtonVariant, string> = {
  primary:
    "bg-public-forest text-public-cream shadow-sm shadow-public-forest/20 hover:-translate-y-0.5 hover:bg-public-forest/90",
  secondary:
    "border border-public-forest/20 bg-white/70 text-public-forest hover:-translate-y-0.5 hover:bg-white",
  amber:
    "bg-public-amber text-public-ink shadow-sm shadow-public-amber/30 hover:-translate-y-0.5 hover:bg-public-amber/90",
  ghost: "text-public-forest hover:bg-public-forest/5",
};

/** Kelas tombol situs publik; dipakai untuk tautan maupun tombol form. */
export function publicButtonClasses(
  variant: PublicButtonVariant = "primary",
  className?: string,
): string {
  return cn(
    "inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-leaf/50 focus-visible:ring-offset-2 focus-visible:ring-offset-public-cream disabled:pointer-events-none disabled:opacity-60 [&_svg]:size-4 [&_svg]:shrink-0",
    VARIANTS[variant],
    className,
  );
}

interface PublicLinkButtonProps
  extends Omit<ComponentProps<typeof Link>, "className"> {
  variant?: PublicButtonVariant;
  className?: string;
  children: ReactNode;
}

export function PublicLinkButton({
  variant = "primary",
  className,
  children,
  ...props
}: PublicLinkButtonProps) {
  return (
    <Link className={publicButtonClasses(variant, className)} {...props}>
      {children}
    </Link>
  );
}
