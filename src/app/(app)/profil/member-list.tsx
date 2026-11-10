"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NativeSelect } from "@/components/app/select-field";
import { updateMemberActive, updateMemberRole } from "@/features/profiles/actions";
import { ROLE_LABELS } from "@/features/auth/roles";
import type { AppRole, ProfileRow } from "@/types/database";

interface MemberListProps {
  members: ProfileRow[];
  currentUserId: string;
}

export function MemberList({ members, currentUserId }: MemberListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function changeRole(member: ProfileRow, role: AppRole) {
    if (role === member.role) return;

    startTransition(async () => {
      const result = await updateMemberRole({ userId: member.id, role });

      if (!result.ok) {
        toast.error(result.error ?? "Gagal mengubah peran.");
        return;
      }

      toast.success("Peran anggota diperbarui.");
      router.refresh();
    });
  }

  function toggleActive(member: ProfileRow) {
    startTransition(async () => {
      const result = await updateMemberActive({
        userId: member.id,
        isActive: !member.is_active,
      });

      if (!result.ok) {
        toast.error(result.error ?? "Gagal mengubah status akun.");
        return;
      }

      toast.success(
        member.is_active ? "Akun dinonaktifkan." : "Akun diaktifkan.",
      );
      router.refresh();
    });
  }

  return (
    <Card className="shadow-xs">
      <CardHeader>
        <CardTitle>Daftar Anggota</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <ul className="divide-y">
          {members.map((member) => {
            const isSelf = member.id === currentUserId;
            return (
              <li
                key={member.id}
                className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 transition-colors hover:bg-muted/40"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {member.full_name || "Belum diisi"}
                    {isSelf ? (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (Anda)
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {member.phone || "-"}
                    {!member.is_active ? (
                      <span className="ml-2 text-destructive">(nonaktif)</span>
                    ) : null}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <NativeSelect
                    value={member.role}
                    disabled={isPending || isSelf}
                    aria-label={`Peran ${member.full_name || "anggota"}`}
                    className="h-8 w-32"
                    onChange={(event) =>
                      changeRole(member, event.target.value as AppRole)
                    }
                  >
                    <option value="chairman">Ketua</option>
                    <option value="treasurer">Bendahara</option>
                    <option value="manager">Pengurus</option>
                  </NativeSelect>

                  {!isSelf ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isPending}
                      onClick={() => toggleActive(member)}
                    >
                      {isPending ? <Loader2 className="animate-spin" aria-hidden /> : null}
                      {member.is_active ? "Nonaktifkan" : "Aktifkan"}
                    </Button>
                  ) : (
                    <Badge variant="outline">{ROLE_LABELS[member.role]}</Badge>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
