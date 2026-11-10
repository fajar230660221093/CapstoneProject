"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RotateCcw, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  cancelActivity,
  restoreActivity,
} from "@/features/activities/actions";
import type { ActivityStatus } from "@/types/database";

export function ActivityActions({
  id,
  status,
}: {
  id: string;
  status: ActivityStatus;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function run(action: "cancel" | "restore") {
    if (
      action === "cancel" &&
      !window.confirm("Batalkan agenda ini? Agenda tidak akan tampil di publik.")
    ) {
      return;
    }

    startTransition(async () => {
      const result =
        action === "cancel"
          ? await cancelActivity(id)
          : await restoreActivity(id);

      if (!result.ok) {
        toast.error(result.error ?? "Agenda gagal diperbarui.");
        return;
      }

      toast.success(
        action === "cancel"
          ? "Agenda dibatalkan."
          : "Agenda dipulihkan menjadi direncanakan.",
      );
      router.refresh();
    });
  }

  if (status === "cancelled") {
    return (
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() => run("restore")}
      >
        {isPending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <RotateCcw className="size-3.5" />
        )}
        Pulihkan
      </Button>
    );
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className="text-destructive hover:text-destructive"
      disabled={isPending}
      onClick={() => run("cancel")}
    >
      {isPending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <XCircle className="size-3.5" />
      )}
      Batalkan
    </Button>
  );
}
