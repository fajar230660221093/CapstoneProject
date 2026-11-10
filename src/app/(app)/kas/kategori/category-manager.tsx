"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Power } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/app/select-field";
import {
  activateTransactionCategory,
  createTransactionCategory,
  deactivateTransactionCategory,
} from "@/features/transactions/category-actions";
import type { CategoryKind, TransactionCategoryRow } from "@/types/database";

const KIND_LABELS: Record<CategoryKind, string> = {
  income: "Pemasukan",
  expense: "Pengeluaran",
  both: "Pemasukan & Pengeluaran",
};

interface CategoryManagerProps {
  categories: TransactionCategoryRow[];
  canManage: boolean;
}

export function CategoryManager({ categories, canManage }: CategoryManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [code, setCode] = useState("");
  const [label, setLabel] = useState("");
  const [kind, setKind] = useState<CategoryKind>("income");
  const [error, setError] = useState<string | null>(null);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await createTransactionCategory({ code, label, kind });

      if (!result.ok) {
        setError(result.error ?? "Gagal menambah kategori.");
        return;
      }

      toast.success("Kategori ditambahkan.");
      setCode("");
      setLabel("");
      router.refresh();
    });
  }

  function toggle(category: TransactionCategoryRow) {
    startTransition(async () => {
      const result = category.is_active
        ? await deactivateTransactionCategory(category.id)
        : await activateTransactionCategory(category.id);

      if (!result.ok) {
        toast.error(result.error ?? "Gagal mengubah kategori.");
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {canManage ? (
        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle>Tambah Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="code" className="text-xs">
                    Kode
                  </Label>
                  <Input
                    id="code"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    placeholder="mis. bakti_sosial"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="label" className="text-xs">
                    Nama kategori
                  </Label>
                  <Input
                    id="label"
                    value={label}
                    onChange={(event) => setLabel(event.target.value)}
                    placeholder="mis. Bakti Sosial"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="kind" className="text-xs font-medium">
                    Digunakan untuk
                  </Label>
                  <NativeSelect
                    id="kind"
                    value={kind}
                    onChange={(event) =>
                      setKind(event.target.value as CategoryKind)
                    }
                  >
                    <option value="income">Pemasukan</option>
                    <option value="expense">Pengeluaran</option>
                    <option value="both">Keduanya</option>
                  </NativeSelect>
                </div>
              </div>

              {error ? (
                <p className="text-sm text-destructive">{error}</p>
              ) : null}

              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="animate-spin" aria-hidden />
                ) : (
                  <Plus className="size-4" aria-hidden />
                )}
                Tambah
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle>Daftar Kategori</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <ul className="divide-y">
            {categories.map((category) => (
              <li
                key={category.id}
                className="flex items-center justify-between gap-3 px-6 py-3 transition-colors hover:bg-muted/40"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {category.label}
                    {!category.is_active ? (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (nonaktif)
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Kode: {category.code}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant="outline">{KIND_LABELS[category.kind]}</Badge>
                  {canManage ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isPending}
                      onClick={() => toggle(category)}
                    >
                      <Power className="size-4" aria-hidden />
                      {category.is_active ? "Nonaktifkan" : "Aktifkan"}
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
