import { CalendarDays, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroIllustrationProps {
  className?: string;
  nextActivityTitle?: string | null;
  nextActivityDate?: string | null;
}

/**
 * Ilustrasi utama situs publik: perbukitan, sawah, dan rumah dusun.
 * Dibuat SVG inline supaya ringan, tajam di semua ukuran, dan tidak
 * bergantung pada foto stok.
 */
export function HeroIllustration({
  className,
  nextActivityTitle,
  nextActivityDate,
}: HeroIllustrationProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[2.5rem] bg-public-sand ring-1 ring-public-forest/10 shadow-2xl shadow-public-forest/10",
        className,
      )}
    >
      <svg
        viewBox="0 0 640 520"
        className="h-full w-full"
        role="img"
        aria-label="Ilustrasi perbukitan hijau, sawah, dan rumah di Dusun Tagog"
      >
        <defs>
          <linearGradient id="hero-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#faf4e4" />
            <stop offset="100%" stopColor="#e6efdc" />
          </linearGradient>
          <linearGradient id="hero-sun" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f4d27a" />
            <stop offset="100%" stopColor="#e7b74a" />
          </linearGradient>
          <linearGradient id="hero-foreground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7ba57a" />
            <stop offset="100%" stopColor="#5c8a66" />
          </linearGradient>
        </defs>

        <rect width="640" height="520" fill="url(#hero-sky)" />

        <circle cx="486" cy="112" r="58" fill="url(#hero-sun)" />
        <circle
          cx="486"
          cy="112"
          r="78"
          fill="#f4d27a"
          opacity="0.18"
        />

        <g fill="#ffffff" opacity="0.7">
          <rect x="88" y="92" width="82" height="20" rx="10" />
          <rect x="118" y="76" width="42" height="20" rx="10" />
          <rect x="352" y="72" width="62" height="16" rx="8" />
          <rect x="376" y="60" width="32" height="16" rx="8" />
        </g>

        <path
          d="M0 300 C84 224 152 248 232 284 C312 320 382 232 470 252 C540 268 602 300 640 278 L640 520 L0 520 Z"
          fill="#c9ddb9"
        />
        <path
          d="M0 356 C96 300 178 330 268 340 C366 350 432 300 520 316 C580 326 622 342 640 332 L640 520 L0 520 Z"
          fill="#a6c792"
        />
        <path
          d="M0 430 C118 382 204 410 304 400 C424 388 522 360 640 390 L640 520 L0 520 Z"
          fill="url(#hero-foreground)"
        />

        <g fill="none" stroke="#dcebcb" strokeWidth="2" opacity="0.55">
          <path d="M-20 412 C100 380 190 404 300 396 C420 386 530 366 660 392" />
          <path d="M-20 432 C100 400 200 424 310 414 C430 404 540 384 660 410" />
          <path d="M-20 454 C110 422 210 446 320 436 C440 426 550 406 660 432" />
          <path d="M-20 478 C120 446 220 470 330 460 C450 450 560 430 660 456" />
        </g>

        <path
          d="M300 520 C308 472 330 440 362 412 C396 382 438 364 484 354"
          fill="none"
          stroke="#ead9b2"
          strokeWidth="30"
          strokeLinecap="round"
        />
        <path
          d="M300 520 C308 472 330 440 362 412 C396 382 438 364 484 354"
          fill="none"
          stroke="#f4e8c9"
          strokeWidth="18"
          strokeLinecap="round"
        />

        <g>
          <rect x="438" y="318" width="92" height="58" rx="6" fill="#f7efd9" />
          <path
            d="M424 322 L484 278 L544 322 Z"
            fill="#3f6b51"
          />
          <rect x="466" y="338" width="20" height="38" rx="3" fill="#a97b4f" />
          <rect x="496" y="330" width="16" height="16" rx="2" fill="#8fb7a0" />
          <rect x="451" y="330" width="12" height="12" rx="2" fill="#8fb7a0" />
        </g>

        <g>
          <rect x="112" y="330" width="8" height="46" rx="4" fill="#5b4633" />
          <circle cx="116" cy="316" r="30" fill="#3f6b51" />
          <circle cx="98" cy="330" r="22" fill="#4d7d5d" />
          <circle cx="136" cy="332" r="20" fill="#4d7d5d" />
        </g>
        <g>
          <rect x="556" y="342" width="7" height="38" rx="3.5" fill="#5b4633" />
          <circle cx="560" cy="330" r="24" fill="#3f6b51" />
          <circle cx="546" cy="342" r="17" fill="#4d7d5d" />
          <circle cx="574" cy="344" r="16" fill="#4d7d5d" />
        </g>

        <g fill="#345944">
          <circle cx="388" cy="414" r="7" />
          <path d="M381 424 L395 424 L398 452 L389 452 L386 438 L383 452 L375 452 Z" />
          <circle cx="414" cy="422" r="6" />
          <path d="M408 431 L421 431 L423 455 L415 455 L413 443 L410 455 L403 455 Z" />
        </g>

        <g
          fill="none"
          stroke="#3f6b51"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.65"
        >
          <path d="M186 150 C194 142 202 142 210 150" />
          <path d="M210 150 C218 142 226 142 234 150" />
          <path d="M318 128 C325 121 332 121 339 128" />
          <path d="M339 128 C346 121 353 121 360 128" />
        </g>
      </svg>

      <div className="absolute left-4 top-4 max-w-[10.5rem] rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-xl shadow-public-forest/10 backdrop-blur-sm sm:left-5 sm:top-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-public-muted">
          Prinsip kami
        </p>
        <p className="mt-1.5 flex items-center gap-2 text-sm font-semibold text-public-forest">
          <ShieldCheck className="size-4 shrink-0" />
          Terbuka &amp; tercatat
        </p>
      </div>

      <div className="absolute bottom-4 right-4 max-w-[13.5rem] rounded-2xl border border-white/70 bg-public-forest px-4 py-3 text-public-cream shadow-xl shadow-public-forest/20 sm:bottom-5 sm:right-5">
        <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-public-cream/60">
          <CalendarDays className="size-3.5 text-public-amber" />
          Agenda berikutnya
        </p>
        <p className="mt-1.5 line-clamp-2 text-sm font-semibold leading-snug">
          {nextActivityTitle ?? "Belum ada agenda baru"}
        </p>
        <p className="mt-1 text-[11px] text-public-cream/65">
          {nextActivityDate ?? "Pantau halaman agenda"}
        </p>
      </div>
    </div>
  );
}
