"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/app/select-field";
import { Textarea } from "@/components/ui/textarea";
import {
  createActivity,
  updateActivity,
} from "@/features/activities/actions";
import {
  ACTIVITY_STATUS_LABELS,
  EDITABLE_ACTIVITY_STATUSES,
} from "@/features/activities/constants";
import type { ActivityRow } from "@/types/database";
import type { ActivityFormValues } from "@/features/activities/schema";

interface ActivityFormProps {
  activity?: ActivityRow;
}

export function ActivityForm({ activity }: ActivityFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [values, setValues] = useState<ActivityFormValues>({
    title: activity?.title ?? "",
    description: activity?.description ?? "",
    location: activity?.location ?? "",
    startsAt: activity?.starts_at
      ? toLocalInput(activity.starts_at)
      : "",
    endsAt: activity?.ends_at ? toLocalInput(activity.ends_at) : "",
    status:
      activity?.status && activity.status !== "cancelled"
        ? activity.status
        : "planned",
    isPublic: activity?.is_public ?? true,
  });

  function update<K extends keyof ActivityFormValues>(
    key: K,
    value: ActivityFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = activity
        ? await updateActivity(activity.id, values)
        : await createActivity(values);

      if (!result.ok) {
        setError(result.error ?? "Agenda gagal disimpan.");
        toast.error(result.error ?? "Agenda gagal disimpan.");
        return;
      }

      toast.success(
        activity ? "Agenda berhasil diperbarui." : "Agenda berhasil dibuat.",
      );
      router.push("/kelola/agenda");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {error ? (
        <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="title">Nama kegiatan</Label>
          <Input
            id="title"
            value={values.title}
            onChange={(event) => update("title", event.target.value)}
            placeholder="Contoh: Gotong royong membersihkan saluran air"
            maxLength={160}
            required
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="startsAt">Mulai (WIB)</Label>
          <Input
            id="startsAt"
            type="datetime-local"
            value={values.startsAt}
            onChange={(event) => update("startsAt", event.target.value)}
            required
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="endsAt">Selesai (WIB, opsional)</Label>
          <Input
            id="endsAt"
            type="datetime-local"
            value={values.endsAt ?? ""}
            onChange={(event) => update("endsAt", event.target.value)}
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="location">Lokasi</Label>
          <Input
            id="location"
            value={values.location ?? ""}
            onChange={(event) => update("location", event.target.value)}
            placeholder="Contoh: Balai dusun"
            maxLength={200}
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <NativeSelect
            id="status"
            value={values.status}
            onChange={(event) =>
              update(
                "status",
                event.target.value as ActivityFormValues["status"],
              )
            }
            className="mt-1.5"
          >
            {EDITABLE_ACTIVITY_STATUSES.map((status) => (
              <option key={status} value={status}>
                {ACTIVITY_STATUS_LABELS[status]}
              </option>
            ))}
          </NativeSelect>
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="description">Deskripsi</Label>
          <Textarea
            id="description"
            value={values.description ?? ""}
            onChange={(event) => update("description", event.target.value)}
            placeholder="Ceritakan tujuan, peserta yang diharapkan, atau hal yang perlu dibawa."
            rows={5}
            maxLength={2000}
            className="mt-1.5"
          />
        </div>
      </div>

      <label className="flex items-start gap-3 rounded-xl border bg-muted/30 px-4 py-3">
        <input
          type="checkbox"
          checked={values.isPublic}
          onChange={(event) => update("isPublic", event.target.checked)}
          className="mt-0.5 size-4 rounded border-input accent-primary"
        />
        <span>
          <span className="block text-sm font-medium">
            Tampilkan di halaman publik
          </span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            Agenda yang ditampilkan bisa dibaca warga di /agenda. Agenda yang
            dibatalkan tidak pernah tampil di publik.
          </span>
        </span>
      </label>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button asChild variant="outline">
          <Link href="/kelola/agenda">Batal</Link>
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          {activity ? "Simpan perubahan" : "Buat agenda"}
        </Button>
      </div>
    </form>
  );
}

/**
 * Nilai <input type="datetime-local"> butuh format WIB tanpa zona waktu.
 * Fungsi kecil ini sengaja tidak mengimpor modul server, supaya form tetap
 * ringan di browser.
 */
function toLocalInput(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}
