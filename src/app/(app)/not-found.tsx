import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppNotFound() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card px-6 py-16 text-center">
      <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <FileQuestion className="size-5" aria-hidden />
      </div>
      <p className="font-heading text-lg font-semibold">Halaman tidak ditemukan</p>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        Data yang Anda cari mungkin sudah dipindahkan atau diarsipkan.
      </p>
      <Button asChild variant="outline" size="sm" className="mt-5">
        <Link href="/dasbor">Kembali ke dasbor</Link>
      </Button>
    </div>
  );
}
