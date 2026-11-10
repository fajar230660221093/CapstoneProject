import { canViewFinance, getCurrentUser } from "@/features/auth/session";
import { getSelectedPeriod } from "@/features/periods/queries";
import {
  listAllTransactions,
  listTransactionCategories,
} from "@/features/transactions/queries";
import { buildRecap } from "@/features/reports/recap";
import { buildFileName, buildRecapWorkbook } from "@/features/reports/excel";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Unduh rekap kas dalam format Excel (.xlsx). */
export async function GET() {
  const user = await getCurrentUser();

  if (!user || !canViewFinance(user.profile.role)) {
    return new Response("Tidak diizinkan", { status: 401 });
  }

  const period = await getSelectedPeriod();
  if (!period) {
    return new Response("Belum ada periode kepengurusan.", { status: 400 });
  }

  const [transactions, categories, supabase] = await Promise.all([
    listAllTransactions(period.id),
    listTransactionCategories(),
    createClient(),
  ]);

  const { data: org } = await supabase
    .from("organization_profiles")
    .select("org_name")
    .maybeSingle();

  const recap = buildRecap(transactions, categories);

  const categoryLabels = new Map(
    categories.map((category) => [category.id, category.label]),
  );

  const buffer = await buildRecapWorkbook({
    periodName: period.name,
    organizationName: org?.org_name ?? "Karang Taruna Dusun Tagog",
    recap,
    transactions,
    categoryLabels,
  });

  const fileName = buildFileName("rekap-kas", period.name);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
