import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { requireUser } from "@/features/auth/session";
import { listMembers } from "@/features/profiles/queries";
import { MemberList } from "./member-list";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = {
  title: "Profil",
};

export default async function ProfilPage() {
  const user = await requireUser();
  const members = await listMembers();

  const isChairman = user.profile.role === "chairman";

  return (
    <div className="space-y-5">
      <PageHeader
        title="Profil & Pengguna"
        description="Atur data diri dan kelola anggota organisasi."
      />

      <ProfileForm
        fullName={user.profile.full_name}
        phone={user.profile.phone}
      />

      {isChairman ? <MemberList members={members} currentUserId={user.id} /> : null}
    </div>
  );
}
