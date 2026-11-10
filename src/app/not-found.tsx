import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RootNotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <FileQuestion className="size-6" aria-hidden />
      </div>
      <div>
        <p className="font-heading text-2xl font-semibold">404</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Halaman yang Anda cari tidak ditemukan.
        </p>
      </div>
      <Button asChild size="sm">
        <Link href="/dasbor">Kembali ke dasbor</Link>
      </Button>
    </div>
  );
}
