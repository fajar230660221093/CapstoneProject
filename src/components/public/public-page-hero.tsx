import type { ReactNode } from "react";

interface PublicPageHeroProps {
  eyebrow: string;
  title: string;
  description?: string;
  children?: ReactNode;
}

export function PublicPageHero({
  eyebrow,
  title,
  description,
  children,
}: PublicPageHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-public-forest/10 bg-public-sand/60">
      <div
        aria-hidden
        className="absolute -right-24 -top-28 size-80 rounded-full bg-public-amber/25 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -left-28 bottom-0 size-80 rounded-full bg-public-leaf/10 blur-3xl"
      />
      <div className="relative mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="max-w-3xl">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-public-leaf">
            <span className="h-px w-6 bg-public-leaf/50" />
            {eyebrow}
          </p>
          <h1 className="mt-3 font-heading text-4xl font-semibold tracking-tight text-public-ink sm:text-5xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-public-muted sm:text-lg">
              {description}
            </p>
          ) : null}
          {children ? <div className="mt-6">{children}</div> : null}
        </div>
      </div>
    </section>
  );
}
