import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { listProfiles } from "@/features/profiles/queries";
import type {
  DocumentCategoryRow,
  DocumentRow,
  DocumentVersionRow,
} from "@/types/database";

export interface DocumentFilters {
  periodId?: string;
  categoryId?: string;
  search?: string;
  includeArchived?: boolean;
  limit?: number;
  offset?: number;
}

export interface DocumentListItem extends DocumentRow {
  categoryLabel: string | null;
  uploaderName: string | null;
  latestVersion: DocumentVersionRow | null;
  versionCount: number;
}

/**
 * Daftar kategori arsip.
 * Di-cache per request supaya tidak di-fetch berulang di halaman yang sama.
 */
export const listDocumentCategories = cache(
  async (): Promise<DocumentCategoryRow[]> => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("document_categories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error)
      throw new Error(`Gagal memuat kategori arsip: ${error.message}`);
    return data ?? [];
  },
);

/**
 * Daftar dokumen arsip.
 * Arsip (soft delete) disembunyikan kecuali diminta secara eksplisit.
 */
export async function listDocuments(
  filters: DocumentFilters = {},
): Promise<DocumentListItem[]> {
  const supabase = await createClient();

  let query = supabase
    .from("documents")
    .select("*")
    .order("created_at", { ascending: false });

  if (!filters.includeArchived) {
    query = query.eq("status", "active");
  }
  if (filters.periodId) {
    query = query.eq("period_id", filters.periodId);
  }
  if (filters.categoryId) {
    query = query.eq("category_id", filters.categoryId);
  }
  if (filters.search?.trim()) {
    query = query.ilike("title", `%${filters.search.trim()}%`);
  }
  if (filters.limit !== undefined) {
    const offset = filters.offset ?? 0;
    query = query.range(offset, offset + filters.limit - 1);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Gagal memuat arsip: ${error.message}`);

  const rows = data ?? [];
  if (rows.length === 0) return [];

  const [categories, profiles, versions] = await Promise.all([
    listDocumentCategories(),
    listProfiles(),
    listVersionsFor(rows.map((row) => row.id)),
  ]);

  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  return rows.map((row) => {
    const rowVersions = versions.get(row.id) ?? [];
    const latest =
      rowVersions.find((v) => v.version_no === row.current_version) ??
      rowVersions[0] ??
      null;

    return {
      ...row,
      categoryLabel: row.category_id
        ? (categoryMap.get(row.category_id)?.label ?? null)
        : null,
      uploaderName:
        profileMap.get(row.uploaded_by)?.full_name ?? null,
      latestVersion: latest,
      versionCount: rowVersions.length,
    };
  });
}

/** Semua versi berkas dari sekumpulan dokumen. */
export async function listVersionsFor(
  documentIds: string[],
): Promise<Map<string, DocumentVersionRow[]>> {
  const result = new Map<string, DocumentVersionRow[]>();
  if (documentIds.length === 0) return result;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("document_versions")
    .select("*")
    .in("document_id", documentIds)
    .order("version_no", { ascending: false });

  if (error) throw new Error(`Gagal memuat versi berkas: ${error.message}`);

  for (const version of data ?? []) {
    const list = result.get(version.document_id) ?? [];
    list.push(version);
    result.set(version.document_id, list);
  }

  return result;
}

/** Detail satu dokumen beserta seluruh versinya. */
export async function getDocument(id: string): Promise<DocumentListItem | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Gagal memuat dokumen: ${error.message}`);
  if (!data) return null;

  const [categories, profiles, versions] = await Promise.all([
    listDocumentCategories(),
    listProfiles(),
    listVersionsFor([data.id]),
  ]);

  const rowVersions = versions.get(data.id) ?? [];
  const latest =
    rowVersions.find((v) => v.version_no === data.current_version) ??
    rowVersions[0] ??
    null;

  return {
    ...data,
    categoryLabel: data.category_id
      ? (categories.find((c) => c.id === data.category_id)?.label ?? null)
      : null,
    uploaderName: profiles.find((p) => p.id === data.uploaded_by)?.full_name ?? null,
    latestVersion: latest,
    versionCount: rowVersions.length,
  };
}

/**
 * Jumlah dokumen arsip yang cocok dengan filter (untuk pagination).
 */
export async function countDocumentsWithFilters(
  filters: DocumentFilters = {},
): Promise<number> {
  const supabase = await createClient();

  let query = supabase
    .from("documents")
    .select("id", { count: "exact", head: true });

  if (!filters.includeArchived) {
    query = query.eq("status", "active");
  }
  if (filters.periodId) {
    query = query.eq("period_id", filters.periodId);
  }
  if (filters.categoryId) {
    query = query.eq("category_id", filters.categoryId);
  }
  if (filters.search?.trim()) {
    query = query.ilike("title", `%${filters.search.trim()}%`);
  }

  const { count, error } = await query;
  if (error) throw new Error(`Gagal menghitung arsip: ${error.message}`);
  return count ?? 0;
}

/** Jumlah dokumen arsip pada satu periode. */
export async function countDocuments(periodId?: string): Promise<number> {
  const supabase = await createClient();
  let query = supabase
    .from("documents")
    .select("id", { count: "exact", head: true })
    .eq("status", "active");

  if (periodId) query = query.eq("period_id", periodId);

  const { count, error } = await query;
  if (error) throw new Error(`Gagal menghitung arsip: ${error.message}`);
  return count ?? 0;
}
