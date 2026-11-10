/**
 * Tipe database untuk SIM Karang Taruna Dusun Tagog.
 *
 * Ditulis manual (bukan hasil generate) supaya repo bisa langsung
 * di-clone tanpa kredensial Supabase. Setelah skema berubah, perbarui
 * file ini atau jalankan ulang generator:
 *
 *   npx supabase gen types typescript --project-id <ref> > src/types/database.ts
 *
 * CATATAN: baris tabel/view ditulis sebagai `type` (bukan `interface`).
 * TypeScript hanya memberi "implicit index signature" pada type alias,
 * sedangkan supabase-js mensyaratkan Row/Insert/Update berbentuk
 * `Record<string, unknown>`.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AppRole = "chairman" | "treasurer" | "manager";
export type PeriodStatus = "active" | "archived";
export type DocumentStatus = "active" | "deleted";
export type TransactionKind = "income" | "expense";
export type TransactionSource = "manual" | "dues" | "import" | "opening_balance";
export type CategoryKind = "income" | "expense" | "both";
export type ActivityStatus = "planned" | "ongoing" | "done" | "cancelled";

export type ProfileRow = {
  id: string;
  full_name: string;
  role: AppRole;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type PeriodRow = {
  id: string;
  name: string;
  start_year: number;
  end_year: number;
  status: PeriodStatus;
  dues_amount: number | null;
  closed_at: string | null;
  closed_by: string | null;
  created_at: string;
  updated_at: string;
};

export type OrganizationProfileRow = {
  id: number;
  org_name: string;
  dusun_name: string;
  address: string | null;
  logo_path: string | null;
  tagline: string | null;
  about_text: string | null;
  vision: string | null;
  mission: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  maps_url: string | null;
  updated_at: string;
};

export type DocumentCategoryRow = {
  id: string;
  code: string;
  label: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

export type TransactionCategoryRow = {
  id: string;
  code: string;
  label: string;
  kind: CategoryKind;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type DocumentRow = {
  id: string;
  period_id: string;
  title: string;
  description: string | null;
  category_id: string | null;
  year: number;
  uploaded_by: string;
  current_version: number;
  status: DocumentStatus;
  deleted_at: string | null;
  deleted_by: string | null;
  created_at: string;
  updated_at: string;
};

export type DocumentVersionRow = {
  id: string;
  document_id: string;
  version_no: number;
  storage_path: string;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  note: string | null;
  uploaded_by: string | null;
  uploaded_at: string;
};

export type CashTransactionRow = {
  id: string;
  period_id: string;
  transaction_date: string;
  kind: TransactionKind;
  amount: number;
  category_id: string | null;
  member_id: string | null;
  description: string | null;
  source: TransactionSource;
  is_public: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  deleted_by: string | null;
};

export type TransactionAttachmentRow = {
  id: string;
  transaction_id: string;
  storage_path: string;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  uploaded_by: string | null;
  created_at: string;
};

export type AuditLogRow = {
  id: number;
  table_name: string;
  record_id: string;
  action: "insert" | "update" | "delete" | "restore";
  actor_id: string | null;
  actor_role: string | null;
  old_data: Json | null;
  new_data: Json | null;
  created_at: string;
};

export type PeriodBalanceRow = {
  period_id: string;
  period_name: string;
  total_income: number;
  total_expense: number;
  balance: number;
};

export type ActivityRow = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  starts_at: string;
  ends_at: string | null;
  status: ActivityStatus;
  is_public: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

/** View publik: tanpa identitas pembuat. */
export type PublicActivityRow = Omit<
  ActivityRow,
  "is_public" | "created_by" | "created_at" | "updated_at"
>;

export type PublicPeriodRow = {
  id: string;
  name: string;
  start_year: number;
  end_year: number;
  status: PeriodStatus;
};

export type PublicTransactionRow = {
  id: string;
  period_id: string;
  transaction_date: string;
  kind: TransactionKind;
  amount: number;
  description: string | null;
  category_code: string | null;
  category_label: string | null;
};

export type PublicTransactionCategoryRow = {
  id: string;
  code: string;
  label: string;
  kind: CategoryKind;
};

/** Bentuk tabel generik untuk Supabase Typed Database. */
type Table<Row, Insert = Partial<Row>, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

/** Bentuk view generik (view di sini bersifat dibaca-saja). */
type View<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<ProfileRow>;
      periods: Table<PeriodRow>;
      organization_profiles: Table<OrganizationProfileRow>;
      document_categories: Table<DocumentCategoryRow>;
      transaction_categories: Table<TransactionCategoryRow>;
      documents: Table<DocumentRow>;
      document_versions: Table<DocumentVersionRow>;
      cash_transactions: Table<CashTransactionRow>;
      transaction_attachments: Table<TransactionAttachmentRow>;
      audit_logs: Table<AuditLogRow>;
      activities: Table<ActivityRow>;
    };
    Views: {
      period_balances: View<PeriodBalanceRow>;
      public_periods: View<PublicPeriodRow>;
      public_period_balances: View<PeriodBalanceRow>;
      public_transactions: View<PublicTransactionRow>;
      public_transaction_categories: View<PublicTransactionCategoryRow>;
      public_activities: View<PublicActivityRow>;
    };
    Functions: {
      current_role: { Args: Record<PropertyKey, never>; Returns: AppRole };
      is_chairman: { Args: Record<PropertyKey, never>; Returns: boolean };
      is_treasurer: { Args: Record<PropertyKey, never>; Returns: boolean };
      is_board: { Args: Record<PropertyKey, never>; Returns: boolean };
      create_cash_transaction: {
        Args: {
          p_period_id: string;
          p_transaction_date: string;
          p_kind: TransactionKind;
          p_amount: number;
          p_category_id: string | null;
          p_description: string | null;
          p_source?: TransactionSource;
          p_attachments?: Json;
        };
        Returns: string;
      };
      update_cash_transaction: {
        Args: {
          p_transaction_id: string;
          p_transaction_date: string;
          p_kind: TransactionKind;
          p_amount: number;
          p_category_id: string | null;
          p_description: string | null;
        };
        Returns: undefined;
      };
      import_cash_transactions: {
        Args: { p_period_id: string; p_rows: Json };
        Returns: number;
      };
      create_document_with_version: {
        Args: {
          p_period_id: string;
          p_title: string;
          p_description: string | null;
          p_category_id: string | null;
          p_year: number;
          p_versions?: Json;
        };
        Returns: string;
      };
    };
    Enums: {
      app_role: AppRole;
      period_status: PeriodStatus;
      document_status: DocumentStatus;
      transaction_kind: TransactionKind;
      transaction_source: TransactionSource;
      category_kind: CategoryKind;
      activity_status: ActivityStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
