import { BarChart3 } from "lucide-react";
import { formatRupiah } from "@/lib/money";
import type { MonthlyRecapRow } from "@/features/reports/recap";

function monthShort(label: string): string {
  return label.split(" ")[0]?.slice(0, 3) ?? label;
}

export function TransparencyChart({
  monthly,
}: {
  monthly: MonthlyRecapRow[];
}) {
  const rows = monthly.slice(-12);

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-public-forest/20 bg-white/40 px-6 py-12 text-center">
        <span className="flex size-11 items-center justify-center rounded-full bg-public-forest/10 text-public-forest">
          <BarChart3 className="size-5" />
        </span>
        <p className="mt-3 font-medium text-public-ink">Belum ada data bulanan</p>
        <p className="mt-1 max-w-sm text-sm text-public-muted">
          Grafik akan muncul setelah pengurus mencatat transaksi pada periode
          ini.
        </p>
      </div>
    );
  }

  const maxValue = Math.max(
    1,
    ...rows.flatMap((row) => [row.income, row.expense]),
  );
  const totalIncome = rows.reduce((sum, row) => sum + row.income, 0);
  const totalExpense = rows.reduce((sum, row) => sum + row.expense, 0);

  return (
    <div className="rounded-3xl border border-public-forest/10 bg-white/70 p-5 shadow-[0_18px_60px_-42px_rgba(31,77,58,0.55)] backdrop-blur-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-public-muted">
            Arus kas {rows.length} bulan terakhir
          </p>
          <p className="mt-1 text-sm text-public-muted">
            Pemasukan <span className="font-semibold text-public-forest">{formatRupiah(totalIncome)}</span>
            <span className="mx-1.5 text-public-forest/30">•</span>
            Pengeluaran <span className="font-semibold text-public-ink">{formatRupiah(totalExpense)}</span>
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium text-public-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-public-leaf" />
            Masuk
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-public-amber" />
            Keluar
          </span>
        </div>
      </div>

      <div
        className="mt-6 overflow-x-auto pb-1"
        role="img"
        aria-label={`Grafik arus kas ${rows.length} bulan terakhir`}
      >
        <div className="flex min-w-[28rem] items-end gap-2">
          {rows.map((row) => {
            const incomeHeight = Math.max(
              4,
              Math.round((row.income / maxValue) * 150),
            );
            const expenseHeight = Math.max(
              4,
              Math.round((row.expense / maxValue) * 150),
            );

            return (
              <div
                key={row.month}
                className="flex min-w-0 flex-1 flex-col items-center gap-2"
              >
                <div className="flex h-40 w-full items-end justify-center gap-1">
                  <div
                    className="w-2.5 rounded-t-full bg-public-leaf transition-all sm:w-3"
                    style={{ height: `${incomeHeight}px` }}
                    title={`Masuk ${row.label}: ${formatRupiah(row.income)}`}
                  />
                  <div
                    className="w-2.5 rounded-t-full bg-public-amber transition-all sm:w-3"
                    style={{ height: `${expenseHeight}px` }}
                    title={`Keluar ${row.label}: ${formatRupiah(row.expense)}`}
                  />
                </div>
                <span className="truncate text-[10px] font-medium uppercase tracking-wide text-public-muted">
                  {monthShort(row.label)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
