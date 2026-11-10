"use client";

import {
  createContext,
  useContext,
  useState,
  useTransition,
  type ReactNode,
} from "react";
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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface ArchiveContextValue {
  /** Minta konfirmasi arsip untuk sebuah transaksi. */
  requestArchive: (id: string) => void;
}

const ArchiveContext = createContext<ArchiveContextValue | null>(null);

/**
 * Provider untuk aksi arsip.
 *
 * Dialog konfirmasi hanya dibuat SATU kali untuk seluruh daftar, bukan satu
 * per baris. Sebelumnya setiap baris memasang instance Radix AlertDialog
 * sendiri (puluhan instance sekaligus), yang sangat mahal di sisi browser.
 */
export function ArchiveTransactionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [targetId, setTargetId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function run(archivedNow: boolean) {
    if (!targetId) return;

    startTransition(async () => {
      const { archiveTransaction, restoreTransaction } = await import(
        "@/features/transactions/actions"
      );
      const result = archivedNow
        ? await archiveTransaction(targetId)
        : await restoreTransaction(targetId);

      if (!result.ok) {
        toast.error(result.error ?? "Gagal memproses transaksi.");
        return;
      }

      toast.success(
        archivedNow ? "Transaksi diarsipkan." : "Transaksi dipulihkan.",
      );
      setTargetId(null);
      router.refresh();
    });
  }

  return (
    <ArchiveContext.Provider value={{ requestArchive: setTargetId }}>
      {children}

      <AlertDialog
        open={targetId !== null}
        onOpenChange={(open) => {
          if (!open && !isPending) setTargetId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Arsipkan transaksi ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Transaksi tidak akan dihapus permanen, hanya dipindahkan ke
              arsip dan tidak dihitung dalam saldo. Anda bisa memulihkannya
              kapan saja.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={(event) => {
                // Cegah dialog tertutup otomatis supaya tetap bisa menampilkan
                // pesan error bila proses gagal.
                event.preventDefault();
                run(true);
              }}
            >
              {isPending ? (
                <Loader2 className="animate-spin" aria-hidden />
              ) : null}
              Ya, arsipkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ArchiveContext.Provider>
  );
}

interface ArchiveTransactionButtonProps {
  id: string;
  archived: boolean;
}

/** Tombol aksi arsip untuk satu baris tabel. */
export function ArchiveTransactionButton({
  id,
  archived,
}: ArchiveTransactionButtonProps) {
  const context = useContext(ArchiveContext);

  if (archived) {
    return <RestoreTransactionButton id={id} />;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-muted-foreground hover:text-foreground"
      onClick={() => context?.requestArchive(id)}
    >
      <Archive className="size-4" aria-hidden />
      Arsipkan
    </Button>
  );
}

/** Tombol pemulihan untuk transaksi yang sudah diarsipkan. */
function RestoreTransactionButton({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isPending}
      className="text-muted-foreground hover:text-foreground"
      onClick={() => {
        startTransition(async () => {
          const { restoreTransaction } = await import(
            "@/features/transactions/actions"
          );
          const result = await restoreTransaction(id);

          if (!result.ok) {
            toast.error(result.error ?? "Gagal memulihkan transaksi.");
            return;
          }

          toast.success("Transaksi dipulihkan.");
          router.refresh();
        });
      }}
    >
      {isPending ? (
        <Loader2 className="animate-spin" aria-hidden />
      ) : (
        <RotateCcw className="size-4" aria-hidden />
      )}
      Pulihkan
    </Button>
  );
}
