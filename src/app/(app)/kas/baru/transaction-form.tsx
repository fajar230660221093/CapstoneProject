"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Loader2, Paperclip, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/app/select-field";
import { Textarea } from "@/components/ui/textarea";
import { createTransaction } from "@/features/transactions/actions";
import {
  transactionFormSchema,
  type TransactionFormValues,
} from "@/features/transactions/schema";
import { removeUploadedFile, uploadToBucket } from "@/lib/upload-client";
import { todayIso } from "@/lib/dates";
import type { TransactionCategoryRow } from "@/types/database";

interface TransactionFormProps {
  categories: TransactionCategoryRow[];
  userId: string;
}

export function TransactionForm({ categories, userId }: TransactionFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    mode: "onSubmit",
    defaultValues: {
      kind: "income",
      amount: "",
      transactionDate: todayIso(),
      categoryId: "",
      description: "",
      hasReceipt: false,
    },
  });

  const kind = useWatch({ control, name: "kind" });
  // `useWatch` (bukan `watch()`) supaya React Compiler bisa tetap memoisasi
  // komponen ini.
  const amount = useWatch({ control, name: "amount" });

  const visibleCategories = useMemo(
    () => categories.filter((c) => c.kind === "both" || c.kind === kind),
    [categories, kind],
  );

  function selectKind(next: "income" | "expense") {
    setValue("kind", next, { shouldValidate: false });
    setValue("categoryId", "", { shouldValidate: false });
  }

  function formatAmountInput(value: string): string {
    const digits = value.replace(/\D/g, "").slice(0, 15);
    if (!digits) return "";
    return Number(digits).toLocaleString("id-ID");
  }

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setFileError(null);
    setFile(selected);
    setValue("hasReceipt", Boolean(selected));
    if (!selected && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  const onSubmit = handleSubmit((values) => {
    setServerError(null);

    startTransition(async () => {
      const uploadedPaths: string[] = [];

      try {
        if (values.kind === "expense" && !file) {
          setError("hasReceipt", {
            message: "Pengeluaran wajib melampirkan minimal satu bukti/nota.",
          });
          return;
        }

        const attachments = file
          ? [await uploadToBucket("receipts", userId, file)]
          : [];

        uploadedPaths.push(...attachments.map((a) => a.storage_path));

        const result = await createTransaction({
          kind: values.kind,
          amount: Number(values.amount.replace(/\D/g, "")),
          transactionDate: values.transactionDate,
          categoryId: values.categoryId || null,
          description: values.description?.trim() || null,
          attachments,
        });

        if (!result.ok) {
          await Promise.all(
            uploadedPaths.map((path) => removeUploadedFile("receipts", path)),
          );
          setServerError(result.error ?? "Gagal menyimpan transaksi.");
          return;
        }

        toast.success("Transaksi berhasil disimpan.");
        router.push(`/kas/${result.id}`);
        router.refresh();
      } catch (error) {
        await Promise.all(
          uploadedPaths.map((path) => removeUploadedFile("receipts", path)),
        );
        setServerError(
          error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan.",
        );
      }
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {serverError ? (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      ) : null}

      <Card className="shadow-xs">
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label className="font-medium">Jenis transaksi</Label>
            <div className="grid grid-cols-2 gap-2" role="group" aria-label="Jenis transaksi">
              <Button
                type="button"
                variant={kind === "income" ? "default" : "outline"}
                onClick={() => selectKind("income")}
                aria-pressed={kind === "income"}
              >
                Pemasukan
              </Button>
              <Button
                type="button"
                variant={kind === "expense" ? "default" : "outline"}
                onClick={() => selectKind("expense")}
                aria-pressed={kind === "expense"}
              >
                Pengeluaran
              </Button>
            </div>
            {errors.kind ? (
              <p className="text-sm text-destructive">{errors.kind.message}</p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="transactionDate" className="font-medium">
                Tanggal
              </Label>
              <Input
                id="transactionDate"
                type="date"
                max={todayIso()}
                {...register("transactionDate")}
              />
              {errors.transactionDate ? (
                <p className="text-sm text-destructive">
                  {errors.transactionDate.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="font-medium">
                Nominal (Rp)
              </Label>
              <Input
                id="amount"
                inputMode="numeric"
                placeholder="0"
                {...register("amount")}
                value={amount}
                onChange={(event) =>
                  setValue("amount", formatAmountInput(event.target.value), {
                    shouldValidate: true,
                  })
                }
              />
              {errors.amount ? (
                <p className="text-sm text-destructive">{errors.amount.message}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryId" className="font-medium">
              Kategori
            </Label>
            <NativeSelect id="categoryId" {...register("categoryId")}>
              <option value="">Tanpa kategori</option>
              {visibleCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </NativeSelect>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="font-medium">
              Keterangan
            </Label>
            <Textarea
              id="description"
              rows={3}
              placeholder="Contoh: Iuran anggota bulan Maret"
              {...register("description")}
            />
            {errors.description ? (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="receipt" className="font-medium">
              Bukti / nota {kind === "expense" ? "(wajib)" : "(opsional)"}
            </Label>
            <Input
              ref={fileInputRef}
              id="receipt"
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={onFileChange}
            />
            <p className="text-xs text-muted-foreground">
              Maksimal 10 MB. Berkas disimpan privat dan hanya bisa dibuka
              Ketua serta Bendahara.
            </p>
            {file ? (
              <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm">
                <Paperclip className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                <span className="min-w-0 flex-1 truncate">{file.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(0)} KB
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Hapus berkas"
                  onClick={() => {
                    setFile(null);
                    setValue("hasReceipt", false);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                >
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              </div>
            ) : null}
            {fileError ? (
              <p className="text-sm text-destructive">{fileError}</p>
            ) : null}
            {errors.hasReceipt ? (
              <p className="text-sm text-destructive">{errors.hasReceipt.message}</p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Batal
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="animate-spin" aria-hidden />
              Menyimpan...
            </>
          ) : (
            "Simpan Transaksi"
          )}
        </Button>
      </div>
    </form>
  );
}
