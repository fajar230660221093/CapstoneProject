import { canViewFinance, getCurrentUser } from "@/features/auth/session";
import { getSelectedPeriod } from "@/features/periods/queries";
import {
  listAllTransactions,
  listTransactionCategories,
} from "@/features/transactions/queries";
import { buildRecap } from "@/features/reports/recap";
import { renderLpj } from "@/features/reports/render-lpj";
import { createClient } from "@/lib/supabase/server";
import { formatTanggal } from "@/lib/dates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Unduh rekap kas dalam format PDF (Laporan Pertanggungjawaban Kas). */
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

  const recap = buildRecap(transactions, categories);

  const { data: org } = await supabase
    .from("organization_profiles")
    .select("org_name")
    .maybeSingle();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("full_name, role")
    .in("role", ["chairman", "treasurer"]);

  const chairmanName =
    profiles?.find((p) => p.role === "chairman")?.full_name ?? null;
  const treasurerName =
    profiles?.find((p) => p.role === "treasurer")?.full_name ?? null;

  const buffer = await renderLpj({
    organizationName: org?.org_name ?? "Karang Taruna Dusun Tagog",
    periodName: period.name,
    recap,
    generatedAt: formatTanggal(new Date().toISOString()),
    chairmanName,
    treasurerName,
  });

  const fileName = `rekap-kas-${period.name.replace(/[^a-zA-Z0-9]+/g, "-")}.pdf`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
