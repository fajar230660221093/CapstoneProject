"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Download, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { importTransactions } from "@/features/imports/actions";
import { formatRupiah } from "@/lib/money";

interface PreviewSummary {
  headers: string[];
  missingColumns: string[];
  totalRows: number;
  validCount: number;
  invalidCount: number;
  totalIncome: number;
  totalExpense: number;
  totalBalance: number;
}

interface PreviewRow {
  rowNumber: number;
  transactionDate: string | null;
  kind: "income" | "expense" | null;
  amount: number | null;
  categoryCode: string | null;
  description: string | null;
  errors: string[];
}

interface ValidRow {
  transactionDate: string | null;
  kind: "income" | "expense" | null;
  amount: number | null;
  categoryCode: string | null;
  description: string | null;
}

/**
 * Formulir impor kas.
 *
 * Berkas dibaca di SERVER (route `/api/laporan/import-preview`), bukan di
 * browser. Sebelumnya `exceljs` (21 MB) dan `papaparse` diimpor di dalam
 * komponen ini, sehingga keduanya ikut terunduh ke browser setiap kali
 * halaman impor dibuka.
 */
export function ImportForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [summary, setSummary] = useState<PreviewSummary | null>(null);
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [previewTruncated, setPreviewTruncated] = useState(false);
  const [validRows, setValidRows] = useState<ValidRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isPending, startTransition] = useTransition();

  function resetPreview() {
    setSummary(null);
    setPreview([]);
    setPreviewTruncated(false);
    setValidRows([]);
  }

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    resetPreview();
    setFileName(file.name);
    setIsParsing(true);

    try {
      const body = new FormData();
      body.append("file", file);

      const response = await fetch("/api/laporan/import-preview", {
        method: "POST",
        body,
      });

      const payload = (await response.json()) as {
        ok: boolean;
        error?: string;
        summary?: PreviewSummary;
        preview?: PreviewRow[];
        previewTruncated?: boolean;
        validRows?: ValidRow[];
      };

      if (!response.ok || !payload.ok || !payload.summary) {
        setError(payload.error ?? "Gagal membaca berkas.");
        return;
      }

      setSummary(payload.summary);
      setPreview(payload.preview ?? []);
      setPreviewTruncated(payload.previewTruncated ?? false);
      setValidRows(payload.validRows ?? []);

      if (payload.summary.missingColumns.length > 0) {
        setError(
          `Kolom wajib belum ditemukan: ${payload.summary.missingColumns.join(", ")}. ` +
            "Gunakan contoh format yang bisa diunduh di bawah.",
        );
      }
    } catch {
      setError("Gagal membaca berkas. Pastikan berkas tidak rusak.");
    } finally {
      setIsParsing(false);
    }
  }

  function runImport() {
    if (validRows.length === 0) return;

    startTransition(async () => {
      const response = await importTransactions(
        validRows.map((row) => ({
          transactionDate: row.transactionDate as string,
          kind: row.kind as "income" | "expense",
          amount: row.amount as number,
          categoryCode: row.categoryCode,
          description: row.description,
        })),
      );

      if (!response.ok) {
        toast.error(response.error ?? "Gagal mengimpor data.");
        return;
      }

      toast.success(`${response.imported ?? 0} transaksi berhasil diimpor.`);
      resetPreview();
      setFileName(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle>1. Pilih berkas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Gunakan berkas Excel (.xlsx) atau CSV dengan kolom: Tanggal, Jenis,
            Nominal, Kategori, dan Keterangan. Hanya kolom Tanggal dan Nominal
            yang wajib ada.
          </p>

          <Input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.csv,.tsv"
            onChange={onFileChange}
            disabled={isParsing}
          />

          {isParsing ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Membaca berkas di server...
            </p>
          ) : null}

          {fileName ? (
            <p className="text-sm text-muted-foreground">Berkas: {fileName}</p>
          ) : null}

          <Button asChild variant="outline" size="sm">
            <a href="/api/laporan/import-template">
              <Download className="size-4" aria-hidden />
              Unduh contoh format
            </a>
          </Button>
        </CardContent>
      </Card>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {summary ? (
        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle>2. Periksa dan konfirmasi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="rounded-lg border bg-muted/30 px-3 py-2">
                <p className="text-xs text-muted-foreground">Baris valid</p>
                <p className="font-heading text-lg font-semibold">
                  {summary.validCount}
                </p>
              </div>
              <div className="rounded-lg border bg-muted/30 px-3 py-2">
                <p className="text-xs text-muted-foreground">Baris bermasalah</p>
                <p className="font-heading text-lg font-semibold text-destructive">
                  {summary.invalidCount}
                </p>
              </div>
              <div className="rounded-lg border bg-muted/30 px-3 py-2">
                <p className="text-xs text-muted-foreground">Perkiraan saldo</p>
                <p className="font-heading text-lg font-semibold">
                  {formatRupiah(summary.totalBalance)}
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Pemasukan {formatRupiah(summary.totalIncome)} • Pengeluaran{" "}
              {formatRupiah(summary.totalExpense)}
            </p>

            {summary.invalidCount > 0 ? (
              <Alert>
                <AlertTriangle className="size-4" aria-hidden />
                <AlertDescription>
                  {summary.invalidCount} baris tidak akan diimpor karena
                  bermasalah. Perbaiki berkas lalu unggah ulang, atau lanjutkan
                  dengan mengimpor baris yang valid saja.
                </AlertDescription>
              </Alert>
            ) : null}

            <div className="max-h-80 overflow-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted/60 text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Baris</th>
                    <th className="px-3 py-2 font-medium">Tanggal</th>
                    <th className="px-3 py-2 font-medium">Jenis</th>
                    <th className="px-3 py-2 text-right font-medium">Nominal</th>
                    <th className="px-3 py-2 font-medium">Keterangan</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {preview.map((row) => (
                    <tr key={row.rowNumber} className="align-top">
                      <td className="px-3 py-2 text-muted-foreground">
                        {row.rowNumber}
                      </td>
                      <td className="px-3 py-2">{row.transactionDate ?? "-"}</td>
                      <td className="px-3 py-2">
                        {row.kind === "income"
                          ? "Pemasukan"
                          : row.kind === "expense"
                            ? "Pengeluaran"
                            : "-"}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {row.amount !== null ? formatRupiah(row.amount) : "-"}
                      </td>
                      <td className="px-3 py-2">{row.description ?? "-"}</td>
                      <td className="px-3 py-2">
                        {row.errors.length === 0 ? (
                          <span className="text-xs text-emerald-600 dark:text-emerald-400">
                            Siap diimpor
                          </span>
                        ) : (
                          <span className="text-xs text-destructive">
                            {row.errors.join(" ")}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {previewTruncated ? (
              <p className="text-xs text-muted-foreground">
                Hanya 200 baris pertama yang ditampilkan. Seluruh baris valid
                ({summary.validCount} baris) tetap akan diimpor.
              </p>
            ) : null}

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => {
                  resetPreview();
                  setFileName(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={runImport}
                disabled={isPending || validRows.length === 0}
              >
                {isPending ? (
                  <>
                    <Loader2 className="animate-spin" aria-hidden />
                    Mengimpor...
                  </>
                ) : (
                  <>
                    <Upload className="size-4" aria-hidden />
                    Impor {validRows.length} transaksi
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
