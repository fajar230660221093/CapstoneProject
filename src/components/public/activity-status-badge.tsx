import { ACTIVITY_STATUS_LABELS } from "@/features/activities/constants";
import { cn } from "@/lib/utils";
import type { ActivityStatus } from "@/types/database";

const STYLES: Record<ActivityStatus, string> = {
  planned:
    "bg-public-amber/25 text-public-ink dark:bg-amber-400/20 dark:text-amber-100",
  ongoing:
    "bg-public-leaf/15 text-public-forest dark:bg-emerald-400/15 dark:text-emerald-300",
  done: "bg-public-forest/10 text-public-forest dark:bg-emerald-400/10 dark:text-emerald-200",
  cancelled: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
};

export function ActivityStatusBadge({
  status,
  className,
}: {
  status: ActivityStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold",
        STYLES[status],
        className,
      )}
    >
      {ACTIVITY_STATUS_LABELS[status]}
    </span>
  );
}
