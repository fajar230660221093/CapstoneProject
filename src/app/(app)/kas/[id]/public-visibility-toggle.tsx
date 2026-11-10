"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { setTransactionVisibility } from "@/features/transactions/actions";

export function PublicVisibilityToggle({
  id,
  isPublic,
}: {
  id: string;
  isPublic: boolean;
}) {
  const router = useRouter();
  const [visible, setVisible] = useState(isPublic);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = !visible;
    startTransition(async () => {
      const result = await setTransactionVisibility(id, next);
      if (!result.ok) {
        toast.error(result.error ?? "Tampilan publik gagal diubah.");
        return;
      }

      setVisible(next);
      toast.success(
        next
          ? "Transaksi kembali tampil di halaman publik."
          : "Transaksi disembunyikan dari halaman publik.",
      );
      router.refresh();
    });
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={isPending}
      onClick={toggle}
      aria-pressed={visible}
      title={
        visible
          ? "Sembunyikan transaksi dari halaman publik"
          : "Tampilkan transaksi di halaman publik"
      }
    >
      {isPending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : visible ? (
        <Eye className="size-3.5" />
      ) : (
        <EyeOff className="size-3.5" />
      )}
      {visible ? "Tampil di publik" : "Disembunyikan"}
    </Button>
  );
}
