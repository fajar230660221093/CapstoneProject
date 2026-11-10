import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { formatRupiah } from "@/lib/money";
import type { RecapResult } from "./recap";

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 48,
    paddingHorizontal: 40,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#111827",
  },
  header: {
    textAlign: "center",
    marginBottom: 4,
  },
  orgName: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
  },
  title: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginTop: 6,
  },
  period: {
    fontSize: 10,
    marginTop: 2,
    color: "#374151",
  },
  meta: {
    marginTop: 10,
    marginBottom: 12,
    fontSize: 8.5,
    color: "#374151",
  },
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    marginTop: 12,
    marginBottom: 4,
  },
  table: {
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
  },
  cell: {
    paddingVertical: 4,
    paddingHorizontal: 5,
  },
  cellRight: {
    paddingVertical: 4,
    paddingHorizontal: 5,
    textAlign: "right",
  },
  colLabel: { width: "38%" },
  colCount: { width: "16%", textAlign: "right" },
  colMoney: { width: "23%", textAlign: "right" },
  totalRow: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    borderTopWidth: 1,
    borderTopColor: "#9ca3af",
  },
  totalLabel: {
    paddingVertical: 5,
    paddingHorizontal: 5,
    fontFamily: "Helvetica-Bold",
  },
  signatureBlock: {
    marginTop: 28,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  signature: {
    width: 200,
    alignItems: "center",
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 7.5,
    color: "#6b7280",
  },
});

export interface LpjDocumentProps {
  organizationName: string;
  periodName: string;
  recap: RecapResult;
  generatedAt: string;
  treasurerName?: string | null;
  chairmanName?: string | null;
}

/**
 * Dokumen Laporan Pertanggungjawaban Kas (PDF).
 * Menggunakan font bawaan react-pdf agar tidak perlu berkas font tambahan.
 */
export function LpjDocument({
  organizationName,
  periodName,
  recap,
  generatedAt,
  treasurerName,
  chairmanName,
}: LpjDocumentProps) {
  return (
    <Document
      title={`Rekap Kas ${periodName}`}
      author={organizationName}
      subject="Rekapitulasi kas Karang Taruna"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.orgName}>{organizationName.toUpperCase()}</Text>
          <Text style={styles.title}>LAPORAN PERTANGGUNGJAWABAN KAS</Text>
          <Text style={styles.period}>Periode {periodName}</Text>
        </View>

        <Text style={styles.meta}>
          Dibuat pada {generatedAt} • Total {recap.totals.count} transaksi
        </Text>

        <Text style={styles.sectionTitle}>A. Rekapitulasi per Kategori</Text>
        <View style={styles.table}>
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.cell, styles.colLabel]}>Kategori</Text>
            <Text style={[styles.cell, styles.colCount]}>Jumlah</Text>
            <Text style={[styles.cell, styles.colMoney]}>Pemasukan</Text>
            <Text style={[styles.cell, styles.colMoney]}>Pengeluaran</Text>
          </View>

          {recap.rows.map((row) => (
            <View style={styles.row} key={row.label}>
              <Text style={[styles.cell, styles.colLabel]}>{row.label}</Text>
              <Text style={[styles.cell, styles.colCount]}>{row.count}</Text>
              <Text style={[styles.cell, styles.colMoney]}>
                {formatRupiah(row.income)}
              </Text>
              <Text style={[styles.cell, styles.colMoney]}>
                {formatRupiah(row.expense)}
              </Text>
            </View>
          ))}

          <View style={[styles.row, styles.totalRow]}>
            <Text style={[styles.totalLabel, styles.colLabel]}>TOTAL</Text>
            <Text style={[styles.totalLabel, styles.colCount]}>
              {recap.totals.count}
            </Text>
            <Text style={[styles.totalLabel, styles.colMoney]}>
              {formatRupiah(recap.totals.income)}
            </Text>
            <Text style={[styles.totalLabel, styles.colMoney]}>
              {formatRupiah(recap.totals.expense)}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>B. Rekapitulasi per Bulan</Text>
        <View style={styles.table}>
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.cell, styles.colLabel]}>Bulan</Text>
            <Text style={[styles.cell, styles.colMoney]}>Pemasukan</Text>
            <Text style={[styles.cell, styles.colMoney]}>Pengeluaran</Text>
            <Text style={[styles.cell, styles.colMoney]}>Selisih</Text>
          </View>

          {recap.monthly.map((row) => (
            <View style={styles.row} key={row.month}>
              <Text style={[styles.cell, styles.colLabel]}>{row.label}</Text>
              <Text style={[styles.cell, styles.colMoney]}>
                {formatRupiah(row.income)}
              </Text>
              <Text style={[styles.cell, styles.colMoney]}>
                {formatRupiah(row.expense)}
              </Text>
              <Text style={[styles.cell, styles.colMoney]}>
                {formatRupiah(row.balance)}
              </Text>
            </View>
          ))}

          <View style={[styles.row, styles.totalRow]}>
            <Text style={[styles.totalLabel, styles.colLabel]}>SALDO</Text>
            <Text style={[styles.totalLabel, styles.colMoney]}>
              {formatRupiah(recap.totals.income)}
            </Text>
            <Text style={[styles.totalLabel, styles.colMoney]}>
              {formatRupiah(recap.totals.expense)}
            </Text>
            <Text style={[styles.totalLabel, styles.colMoney]}>
              {formatRupiah(recap.totals.balance)}
            </Text>
          </View>
        </View>

        <View style={styles.signatureBlock}>
          <View style={styles.signature}>
            <Text style={{ marginBottom: 4 }}>Mengetahui,</Text>
            <Text>Ketua Karang Taruna</Text>
            <Text style={{ marginTop: 46 }}>
              {chairmanName ?? "..............................."}
            </Text>
          </View>
          <View style={styles.signature}>
            <Text style={{ marginBottom: 4 }}>Bendahara</Text>
            <Text>Dusun Tagog</Text>
            <Text style={{ marginTop: 46 }}>
              {treasurerName ?? "..............................."}
            </Text>
          </View>
        </View>

        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Halaman ${pageNumber} dari ${totalPages} • ${organizationName}`
          }
          fixed
        />
      </Page>
    </Document>
  );
}
