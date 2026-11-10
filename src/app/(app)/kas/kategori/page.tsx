import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import {
  canManageFinance,
  canViewFinance,
  requireUser,
} from "@/features/auth/session";
import { listTransactionCategories } from "@/features/transactions/queries";
import { CategoryManager } from "./category-manager";

export const metadata: Metadata = {
  title: "Kategori Transaksi",
};

export default async function KategoriPage() {
  const user = await requireUser();

  if (!canViewFinance(user.profile.role)) {
    return (
      <div className="space-y-4">
        <PageHeader title="Kategori Transaksi" />
        <p className="text-sm text-muted-foreground">
          Halaman ini hanya untuk Ketua dan Bendahara.
        </p>
      </div>
    );
  }

  const categories = await listTransactionCategories();

  return (
    <div className="space-y-5">
      <PageHeader
        title="Kategori Transaksi"
        description="Kategori dipakai saat mencatat pemasukan dan pengeluaran."
      />

      <CategoryManager
        categories={categories}
        canManage={canManageFinance(user.profile.role)}
      />
    </div>
  );
}
