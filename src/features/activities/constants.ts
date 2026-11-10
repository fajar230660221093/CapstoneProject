import type { ActivityStatus } from "@/types/database";

export const ACTIVITY_STATUS_LABELS: Record<ActivityStatus, string> = {
  planned: "Direncanakan",
  ongoing: "Berlangsung",
  done: "Selesai",
  cancelled: "Dibatalkan",
};

/** Status yang bisa dipilih pengurus di form (cancel lewat aksi terpisah). */
export const EDITABLE_ACTIVITY_STATUSES = [
  "planned",
  "ongoing",
  "done",
] as const;

export type EditableActivityStatus =
  (typeof EDITABLE_ACTIVITY_STATUSES)[number];
