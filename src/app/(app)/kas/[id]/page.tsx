import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
import {
  canManageFinance,
  canViewFinance,
  requireUser,
} from "@/features/auth/session";
import { getTransaction } from "@/features/transactions/queries";
import { ArchiveTransactionButton } from "../archive-transaction-button";
import { PublicVisibilityToggle } from "./public-visibility-toggle";
import { TransactionDetail } from "./transaction-detail";

export const metadata: Metadata = {
  title: "Detail Transaksi",
};

export default async function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();

  if (!canViewFinance(user.profile.role)) {
    notFound();
  }

  const { id } = await params;
  const transaction = await getTransaction(id);

  if (!transaction) notFound();

  const canManage = canManageFinance(user.profile.role);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Detail Transaksi"
        actions={
          canManage ? (
            <>
              <PublicVisibilityToggle
                key={transaction.id}
                id={transaction.id}
                isPublic={transaction.is_public}
              />
              <ArchiveTransactionButton
                id={transaction.id}
                archived={Boolean(transaction.deleted_at)}
              />
            </>
          ) : null
        }
      />

      <TransactionDetail
        transaction={{
          id: transaction.id,
          transaction_date: transaction.transaction_date,
          kind: transaction.kind,
          amount: transaction.amount,
          categoryLabel: transaction.categoryLabel,
          description: transaction.description,
          source: transaction.source,
          creatorName: transaction.creatorName,
          created_at: transaction.created_at,
          deleted_at: transaction.deleted_at,
          is_public: transaction.is_public,
        }}
        attachments={transaction.attachments}
      />
    </div>
  );
}
