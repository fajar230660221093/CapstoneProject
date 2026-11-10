"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updatePublicSiteContent } from "@/features/public/actions";
import type { PublicSiteFormValues } from "@/features/public/schema";

export function PublicSettingsForm({
  initialValues,
}: {
  initialValues: PublicSiteFormValues;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState<PublicSiteFormValues>(initialValues);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof PublicSiteFormValues>(
    key: K,
    value: PublicSiteFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await updatePublicSiteContent(values);
      if (!result.ok) {
        setError(result.error ?? "Konten publik gagal disimpan.");
        toast.error(result.error ?? "Konten publik gagal disimpan.");
        return;
      }

      toast.success("Konten halaman publik berhasil disimpan.");
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

      <Card>
        <CardHeader>
          <CardTitle>Identitas organisasi</CardTitle>
          <CardDescription>
            Nama ini tampil di header, footer, dan judul halaman publik.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="orgName">Nama organisasi</Label>
            <Input
              id="orgName"
              value={values.orgName}
              onChange={(event) => update("orgName", event.target.value)}
              maxLength={120}
              required
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="dusunName">Nama dusun</Label>
            <Input
              id="dusunName"
              value={values.dusunName}
              onChange={(event) => update("dusunName", event.target.value)}
              maxLength={120}
              required
              className="mt-1.5"
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="address">Alamat</Label>
            <Textarea
              id="address"
              value={values.address}
              onChange={(event) => update("address", event.target.value)}
              rows={2}
              maxLength={500}
              className="mt-1.5"
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              value={values.tagline}
              onChange={(event) => update("tagline", event.target.value)}
              placeholder="Satu kalimat singkat tentang organisasi"
              maxLength={200}
              className="mt-1.5"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cerita organisasi</CardTitle>
          <CardDescription>
            Dipakai di halaman Beranda dan Tentang. Tulis dengan bahasa yang
            mudah dipahami warga.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="aboutText">Tentang</Label>
            <Textarea
              id="aboutText"
              value={values.aboutText}
              onChange={(event) => update("aboutText", event.target.value)}
              rows={5}
              maxLength={3000}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="vision">Visi</Label>
            <Textarea
              id="vision"
              value={values.vision}
              onChange={(event) => update("vision", event.target.value)}
              rows={3}
              maxLength={1000}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="mission">Misi</Label>
            <Textarea
              id="mission"
              value={values.mission}
              onChange={(event) => update("mission", event.target.value)}
              rows={5}
              maxLength={2000}
              className="mt-1.5"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Tulis satu poin per baris. Setiap baris akan tampil sebagai butir
              misi di halaman Tentang.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kontak & tautan</CardTitle>
          <CardDescription>
            Isi kontak resmi yang boleh dibaca publik. Bagian yang kosong tidak
            ditampilkan sebagai tautan aktif.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="contactPhone">Telepon / WhatsApp</Label>
            <Input
              id="contactPhone"
              value={values.contactPhone}
              onChange={(event) => update("contactPhone", event.target.value)}
              placeholder="08xxxxxxxxxx"
              maxLength={40}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="contactEmail">Email</Label>
            <Input
              id="contactEmail"
              type="email"
              value={values.contactEmail}
              onChange={(event) => update("contactEmail", event.target.value)}
              placeholder="nama@contoh.com"
              maxLength={160}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="instagramUrl">URL Instagram</Label>
            <Input
              id="instagramUrl"
              type="url"
              value={values.instagramUrl}
              onChange={(event) => update("instagramUrl", event.target.value)}
              placeholder="https://instagram.com/..."
              maxLength={300}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="facebookUrl">URL Facebook</Label>
            <Input
              id="facebookUrl"
              type="url"
              value={values.facebookUrl}
              onChange={(event) => update("facebookUrl", event.target.value)}
              placeholder="https://facebook.com/..."
              maxLength={300}
              className="mt-1.5"
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="mapsUrl">URL Google Maps</Label>
            <Input
              id="mapsUrl"
              type="url"
              value={values.mapsUrl}
              onChange={(event) => update("mapsUrl", event.target.value)}
              placeholder="https://maps.app.goo.gl/..."
              maxLength={300}
              className="mt-1.5"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button asChild variant="outline">
          <Link href="/" target="_blank">
            <ExternalLink className="size-4" />
            Lihat halaman publik
          </Link>
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          Simpan konten publik
        </Button>
      </div>
    </form>
  );
}
