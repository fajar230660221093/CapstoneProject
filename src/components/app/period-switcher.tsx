"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { CalendarDays } from "lucide-react";
import { selectPeriod } from "@/features/periods/actions";
import { NativeSelect } from "@/components/app/select-field";

interface PeriodSwitcherProps {
  periods: { id: string; name: string; status: string }[];
  currentId: string | null;
}

export function PeriodSwitcher({ periods, currentId }: PeriodSwitcherProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (periods.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <CalendarDays
        className="size-4 shrink-0 text-muted-foreground"
        aria-hidden
      />
      <NativeSelect
        value={currentId ?? ""}
        disabled={isPending}
        aria-label="Pilih periode kepengurusan"
        className="w-full sm:w-52"
        onChange={(event) => {
          const value = event.target.value;
          if (!value || value === currentId) return;

          startTransition(async () => {
            await selectPeriod(value);
            router.refresh();
          });
        }}
      >
        {periods.map((period) => (
          <option key={period.id} value={period.id}>
            {period.name}
            {period.status === "archived" ? " (arsip)" : ""}
          </option>
        ))}
      </NativeSelect>
    </div>
  );
}
