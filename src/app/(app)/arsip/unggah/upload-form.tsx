"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";import { Loader2, Paperclip, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/app/select-field";
import { Textarea } from "@/components/ui/textarea";
import { createDocument } from "@/features/documents/actions";
import { removeUploadedFile, uploadToBucket } from "@/lib/upload-client";
import type { DocumentCategoryRow } from "@/types/database";

const uploadFormSchema = z.object({
  title: z
    .string()
    .min(3, "Judul minimal 3 karakter.")
    .max(200, "Judul maksimal 200 karakter."),
  description: z.string().max(1000).optional(),
  categoryId: z.string().optional(),
});

type UploadFormValues = z.infer<typeof uploadFormSchema>;

interface UploadFormProps {
  categories: DocumentCategoryRow[];
  userId: string;
}

export function UploadForm({ categories, userId }: UploadFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UploadFormValues>({
    resolver: zodResolver(uploadFormSchema),
    mode: "onSubmit",
    defaultValues: { title: "", description: "", categoryId: "" },
  });

  const activeCategories = useMemo(
    () => categories.filter((category) => category.is_active),
    [categories],
  );

  function onFilesChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    setFileError(null);

    if (selected.length === 0) {
      setFiles([]);
      return;
    }

    if (selected.length + files.length > 5) {
      setFileError("Maksimal 5 berkas dalam satu unggahan.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const tooBig = selected.find((file) => file.size > 10 * 1024 * 1024);
    if (tooBig) {
      setFileError(
        `Berkas "${tooBig.name}" lebih dari 10 MB. Kompres berkas atau pilih yang lebih kecil.`,
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setFiles((previous) => [...previous, ...selected]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeFile(index: number) {
    setFiles((previous) => previous.filter((_, i) => i !== index));
  }

  const onSubmit = handleSubmit((values) => {
    setServerError(null);

    if (files.length === 0) {
      setFileError("Pilih minimal satu berkas untuk diunggah.");
      return;
    }

    startTransition(async () => {
      const uploadedPaths: string[] = [];

      try {
        const versions = [];
        for (const file of files) {
          const uploaded = await uploadToBucket("documents", userId, file);
          uploadedPaths.push(uploaded.storage_path);
          versions.push(uploaded);
        }

        const result = await createDocument({
          title: values.title,
          description: values.description?.trim() || null,
          categoryId: values.categoryId || null,
          versions,
        });

        if (!result.ok) {
          await Promise.all(
            uploadedPaths.map((path) => removeUploadedFile("documents", path)),
          );
          setServerError(result.error ?? "Gagal menyimpan arsip.");
          return;
        }

        toast.success("Dokumen berhasil diunggah.");
        router.push(`/arsip/${result.id}`);
        router.refresh();
      } catch (error) {
        await Promise.all(
          uploadedPaths.map((path) => removeUploadedFile("documents", path)),
        );
        setServerError(
          error instanceof Error ? error.message : "Terjadi kesalahan saat mengunggah.",
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
            <Label htmlFor="title" className="font-medium">
              Judul dokumen
            </Label>
            <Input
              id="title"
              placeholder="Contoh: Proposal Kegiatan Turnamen Futsal"
              {...register("title")}
            />
            {errors.title ? (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryId" className="font-medium">
              Kategori
            </Label>
            <NativeSelect id="categoryId" {...register("categoryId")}>
              <option value="">Tanpa kategori</option>
              {activeCategories.map((category) => (
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
              placeholder="Keterangan singkat tentang dokumen ini"
              {...register("description")}
            />
            {errors.description ? (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="files" className="font-medium">
              Berkas (maks. 5)
            </Label>
            <Input
              ref={fileInputRef}
              id="files"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,application/pdf,.xlsx,.xls,.csv,.docx"
              onChange={onFilesChange}
            />
            <p className="text-xs text-muted-foreground">
              Maksimal 10 MB per berkas. Berkas pertama menjadi versi 1, berkas
              berikutnya menjadi versi lanjutan.
            </p>

            {files.length > 0 ? (
              <ul className="space-y-2">
                {files.map((file, index) => (
                  <li
                    key={`${file.name}-${file.size}`}
                    className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm"
                  >
                    <Paperclip
                      className="size-4 shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1 truncate">{file.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(0)} KB
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Hapus ${file.name}`}
                      onClick={() => removeFile(index)}
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : null}

            {fileError ? (
              <p className="text-sm text-destructive">{fileError}</p>
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
              Mengunggah...
            </>
          ) : (
            "Unggah"
          )}
        </Button>
      </div>
    </form>
  );
}
