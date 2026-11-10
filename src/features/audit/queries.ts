import { createClient } from "@/lib/supabase/server";
import { listProfiles } from "@/features/profiles/queries";
import type { AuditLogRow } from "@/types/database";

export interface AuditFilters {
  tableName?: string;
  action?: string;
  limit?: number;
  offset?: number;
}

export interface AuditListItem extends AuditLogRow {
  actorName: string | null;
}

export const AUDIT_ACTION_LABELS: Record<string, string> = {
  insert: "Dibuat",
  update: "Diubah",
  delete: "Diarsipkan",
  restore: "Dipulihkan",
};

export const AUDIT_TABLE_LABELS: Record<string, string> = {
  cash_transactions: "Transaksi Kas",
  documents: "Dokumen Arsip",
  document_versions: "Berkas Arsip",
  profiles: "Anggota",
  periods: "Periode",
  transaction_categories: "Kategori Transaksi",
};

/**
 * Jumlah log aktivitas yang cocok dengan filter (untuk pagination).
 */
export async function countAuditLogs(
  filters: AuditFilters = {},
): Promise<number> {
  const supabase = await createClient();

  let query = supabase
    .from("audit_logs")
    .select("id", { count: "exact", head: true });

  if (filters.tableName) {
    query = query.eq("table_name", filters.tableName);
  }
  if (filters.action) {
    query = query.eq("action", filters.action as "insert" | "update" | "delete" | "restore");
  }

  const { count, error } = await query;
  if (error) throw new Error(`Gagal menghitung log aktivitas: ${error.message}`);
  return count ?? 0;
}

/** Daftar log aktivitas terbaru (hanya Ketua & Bendahara yang boleh membaca). */
export async function listAuditLogs(
  filters: AuditFilters = {},
): Promise<AuditListItem[]> {
  const supabase = await createClient();

  let query = supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters.tableName) {
    query = query.eq("table_name", filters.tableName);
  }
  if (filters.action) {
    query = query.eq("action", filters.action as "insert" | "update" | "delete" | "restore");
  }
  if (filters.limit !== undefined) {
    const offset = filters.offset ?? 0;
    query = query.range(offset, offset + filters.limit - 1);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Gagal memuat log aktivitas: ${error.message}`);

  const rows = data ?? [];
  if (rows.length === 0) return [];

  const profiles = await listProfiles();

  const profileMap = new Map(
    profiles.map((profile) => [profile.id, profile]),
  );

  return rows.map((row) => ({
    ...row,
    actorName: row.actor_id
      ? (profileMap.get(row.actor_id)?.full_name ?? null)
      : null,
  }));
}
