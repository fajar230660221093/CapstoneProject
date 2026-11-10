import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTanggal } from "@/lib/dates";
import { createSignedUrl } from "@/lib/storage";
import { getDocument, listVersionsFor } from "@/features/documents/queries";
import { canManageArchive, requireUser } from "@/features/auth/session";
import { ArchiveDocumentButton } from "../archive-document-button";

export const metadata: Metadata = {
  title: "Detail Dokumen",
};

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const document = await getDocument(id);
  if (!document) notFound();

  const versions = (await listVersionsFor([id])).get(id) ?? [];
  const signedUrls = await Promise.all(
    versions.map(async (version) => ({
      version,
      url: await createSignedUrl("documents", version.storage_path),
    })),
  );

  const canArchive = canManageArchive(user.profile.role);

  return (
    <div className="space-y-5">
      <Button asChild variant="ghost" size="sm">
        <Link href="/arsip">
          <ArrowLeft className="size-4" aria-hidden />
          Kembali ke arsip
        </Link>
      </Button>

      <PageHeader
        title={document.title}
        description={`${document.categoryLabel ?? "Tanpa kategori"} • Tahun ${document.year}`}
        actions={
          canArchive ? (
            <ArchiveDocumentButton
              id={document.id}
              archived={document.status === "deleted"}
            />
          ) : null
        }
      />

      {document.status === "deleted" ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          Dokumen ini sudah diarsipkan dan tidak tampil di daftar aktif.
        </div>
      ) : null}

      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle>Informasi</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="divide-y text-sm">
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-muted-foreground">Keterangan</dt>
              <dd className="max-w-md text-right font-medium">
                {document.description ?? "-"}
              </dd>
            </div>
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-muted-foreground">Diunggah oleh</dt>
              <dd className="font-medium">{document.uploaderName ?? "-"}</dd>
            </div>
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-muted-foreground">Tanggal unggah</dt>
              <dd className="font-medium">
                {formatTanggal(document.created_at)}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle>Berkas ({versions.length} versi)</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {signedUrls.map(({ version, url }, index) => (
              <li
                key={version.id}
                className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2"
              >
                <FileText
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {version.file_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Versi {version.version_no}
                    {version.file_size
                      ? ` • ${(version.file_size / 1024).toFixed(0)} KB`
                      : ""}
                    {index === 0 ? " • terbaru" : ""}
                  </p>
                </div>
                {url ? (
                  <Button asChild variant="outline" size="sm">
                    <a href={url} target="_blank" rel="noreferrer">
                      <Download className="size-4" aria-hidden />
                      Unduh
                    </a>
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
