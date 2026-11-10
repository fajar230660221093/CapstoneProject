import { Clock, MapPin } from "lucide-react";
import { ActivityStatusBadge } from "@/components/public/activity-status-badge";
import {
  formatWaktuJakarta,
  getJakartaDateParts,
} from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { PublicActivityRow } from "@/types/database";

function timeLabel(activity: PublicActivityRow): string {
  const start = formatWaktuJakarta(activity.starts_at);
  if (!activity.ends_at) return `${start} WIB`;

  const end = formatWaktuJakarta(activity.ends_at);
  if (start === "-" || end === "-") return `${start} WIB`;
  return `${start} – ${end} WIB`;
}

export function AgendaCard({
  activity,
  featured = false,
  className,
}: {
  activity: PublicActivityRow;
  featured?: boolean;
  className?: string;
}) {
  const parts = getJakartaDateParts(activity.starts_at);
  const done = activity.status === "done";

  return (
    <article
      id={activity.id}
      className={cn(
        "group flex gap-4 rounded-3xl border border-public-forest/10 bg-white/70 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-xl hover:shadow-public-forest/8 sm:p-5",
        done && "opacity-80",
        featured && "sm:gap-5 sm:p-6",
        className,
      )}
    >
      <div
        className={cn(
          "flex w-16 shrink-0 flex-col items-center justify-center rounded-2xl px-2 py-3 text-center",
          done
            ? "bg-public-forest/8 text-public-forest"
            : "bg-public-forest text-public-cream",
        )}
      >
        <span className="font-heading text-2xl font-semibold leading-none">
          {parts?.day ?? "--"}
        </span>
        <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] opacity-75">
          {parts?.month?.replace(".", "") ?? "---"}
        </span>
        <span className="mt-0.5 text-[10px] opacity-60">{parts?.year ?? ""}</span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <ActivityStatusBadge status={activity.status} />
          {featured ? (
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-public-leaf">
              Agenda pilihan
            </span>
          ) : null}
        </div>

        <h3
          className={cn(
            "mt-2 font-heading text-base font-semibold leading-snug text-public-ink",
            featured && "text-lg sm:text-xl",
          )}
        >
          {activity.title}
        </h3>

        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-public-muted">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5" />
            {timeLabel(activity)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-3.5" />
            {activity.location ?? "Lokasi menyusul"}
          </span>
        </div>

        {activity.description ? (
          <p
            className={cn(
              "mt-2 text-sm leading-relaxed text-public-muted",
              !featured && "line-clamp-2",
            )}
          >
            {activity.description}
          </p>
        ) : null}
      </div>
    </article>
  );
}
