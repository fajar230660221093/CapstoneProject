"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export function ArchiveDocumentButton({
  id,
  archived,
}: {
  id: string;
  archived: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  function run(archivedNow: boolean) {
    startTransition(async () => {
      const { archiveDocument, restoreDocument } = await import(
        "@/features/documents/actions"
      );
      const result = archivedNow
        ? await archiveDocument(id)
        : await restoreDocument(id);

      if (!result.ok) {
        toast.error(result.error ?? "Gagal memproses dokumen.");
        return;
      }

      toast.success(
        archivedNow ? "Dokumen diarsipkan." : "Dokumen dipulihkan.",
      );
      setOpen(false);
      router.refresh();
    });
  }

  if (archived) {
    return (
      <Button variant="outline" size="sm" disabled={isPending} onClick={() => run(false)}>
        {isPending ? (
          <Loader2 className="animate-spin" aria-hidden />
        ) : (
          <RotateCcw className="size-4" aria-hidden />
        )}
        Pulihkan
      </Button>
    );
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={isPending}>
          <Archive className="size-4" aria-hidden />
          Arsipkan
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Arsipkan dokumen ini?</AlertDialogTitle>
          <AlertDialogDescription>
            Dokumen akan disembunyikan dari daftar aktif, tetapi tidak dihapus
            dan masih bisa dipulihkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={() => run(true)}>
            Ya, arsipkan
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
