import ExcelJS from "exceljs";
import { canViewFinance, getCurrentUser } from "@/features/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Unduh contoh format berkas untuk impor kas lama. */
export async function GET() {
  const user = await getCurrentUser();

  if (!user || !canViewFinance(user.profile.role)) {
    return new Response("Tidak diizinkan", { status: 401 });
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "SIM Karang Taruna Dusun Tagog";
  const sheet = workbook.addWorksheet("Kas");

  sheet.columns = [
    { header: "Tanggal", key: "tanggal", width: 16 },
    { header: "Jenis", key: "jenis", width: 16 },
    { header: "Nominal", key: "nominal", width: 18 },
    { header: "Kategori", key: "kategori", width: 18 },
    { header: "Keterangan", key: "keterangan", width: 40 },
  ];

  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF3F4F6" },
  };

  sheet.addRow(["08/03/2025", "Pemasukan", 50000, "iuran", "Iuran 20 anggota"]);
  sheet.addRow(["12/03/2025", "Pengeluaran", 275000, "kegiatan", "Sewa tenda"]);
  sheet.addRow(["20/03/2025", "Pemasukan", 1500000, "donasi", "Donasi warga"]);

  for (let row = 2; row <= 4; row += 1) {
    sheet.getCell(`C${row}`).numFmt = "#,##0";
  }

  const buffer = await workbook.xlsx.writeBuffer();

  return new Response(new Uint8Array(Buffer.from(buffer)), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="contoh-impor-kas.xlsx"',
      "Cache-Control": "no-store",
    },
  });
}
