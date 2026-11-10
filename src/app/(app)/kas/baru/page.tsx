import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { canManageFinance, requireUser } from "@/features/auth/session";
import { listTransactionCategories } from "@/features/transactions/queries";
import { TransactionForm } from "./transaction-form";

export const metadata: Metadata = {
  title: "Catat Transaksi",
};

export default async function NewTransactionPage() {
  const user = await requireUser();

  if (!canManageFinance(user.profile.role)) {
    return (
      <div className="space-y-4">
        <PageHeader title="Catat Transaksi" />
        <p className="text-sm text-muted-foreground">
          Hanya Bendahara yang boleh menambah transaksi kas.
        </p>
        <Button asChild variant="outline">
          <Link href="/kas">
            <ArrowLeft className="size-4" aria-hidden />
            Kembali ke daftar kas
          </Link>
        </Button>
      </div>
    );
  }

  const categories = await listTransactionCategories();

  return (
    <div className="space-y-5">
      <PageHeader
        title="Catat Transaksi"
        description="Isi data transaksi kas. Pengeluaran wajib melampirkan bukti/nota."
      />

      <TransactionForm
        categories={categories.filter((category) => category.is_active)}
        userId={user.id}
      />
    </div>
  );
}
