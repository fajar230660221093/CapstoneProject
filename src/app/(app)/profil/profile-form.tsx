"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateOwnProfile } from "@/features/profiles/actions";

interface ProfileFormProps {
  fullName: string;
  phone: string | null;
}

export function ProfileForm({ fullName, phone }: ProfileFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(fullName);
  const [tel, setTel] = useState(phone ?? "");
  const [error, setError] = useState<string | null>(null);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await updateOwnProfile({
        fullName: name,
        phone: tel || null,
      });

      if (!result.ok) {
        setError(result.error ?? "Gagal menyimpan profil.");
        return;
      }

      toast.success("Profil berhasil disimpan.");
      router.refresh();
    });
  }

  return (
    <Card className="shadow-xs">
      <CardHeader>
        <CardTitle>Data diri</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="font-medium">
              Nama lengkap
            </Label>
            <Input
              id="fullName"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="font-medium">
              Nomor telepon (opsional)
            </Label>
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              value={tel}
              onChange={(event) => setTel(event.target.value)}
              placeholder="08xxxxxxxxxx"
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader2 className="animate-spin" aria-hidden /> : null}
            Simpan
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
