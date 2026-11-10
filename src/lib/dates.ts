import { format, parseISO } from "date-fns";
import { id as localeId } from "date-fns/locale";

/** "2025-03-08" -> "8 Maret 2025" */
export function formatTanggal(iso: string | null | undefined): string {
  if (!iso) return "-";
  try {
    return format(parseISO(iso), "d MMMM yyyy", { locale: localeId });
  } catch {
    return iso;
  }
}

/** "2025-03-08" -> "08/03/2025" */
export function formatTanggalPendek(iso: string | null | undefined): string {
  if (!iso) return "-";
  try {
    return format(parseISO(iso), "dd/MM/yyyy");
  } catch {
    return iso;
  }
}

/** "2025-03-08" -> "8 Mar 2025" */
export function formatTanggalSingkat(iso: string | null | undefined): string {
  if (!iso) return "-";
  try {
    return format(parseISO(iso), "d MMM yyyy", { locale: localeId });
  } catch {
    return iso;
  }
}

/** Tanggal hari ini dalam format ISO (YYYY-MM-DD) menurut waktu lokal. */
export function todayIso(): string {
  return format(new Date(), "yyyy-MM-dd");
}

/** "2025-03-08" -> "Maret 2025" */
export function formatBulanTahun(iso: string | null | undefined): string {
  if (!iso) return "-";
  try {
    return format(parseISO(iso), "MMMM yyyy", { locale: localeId });
  } catch {
    return iso;
  }
}

// ---------------------------------------------------------------------
// Agenda memakai timestamp (timestamptz), jadi tampilan dan input harus
// dikunci ke zona waktu Indonesia Barat (WIB/Asia/Jakarta).
// ---------------------------------------------------------------------

const jakartaDateFormatter = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const jakartaDateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta",
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const jakartaTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const jakartaPartsFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Jakarta",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const jakartaDayMonthFormatter = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta",
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function toDate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const value = new Date(iso);
  return Number.isNaN(value.getTime()) ? null : value;
}

/** "2026-11-01T12:00:00Z" -> "1 November 2026" (WIB). */
export function formatTanggalJakarta(
  iso: string | null | undefined,
): string {
  const date = toDate(iso);
  return date ? jakartaDateFormatter.format(date) : "-";
}

/** "2026-11-01T12:00:00Z" -> "1 November 2026, 19.00" (WIB). */
export function formatTanggalWaktuJakarta(
  iso: string | null | undefined,
): string {
  const date = toDate(iso);
  return date ? jakartaDateTimeFormatter.format(date) : "-";
}

/** "2026-11-01T12:00:00Z" -> "19.00" (WIB). */
export function formatWaktuJakarta(iso: string | null | undefined): string {
  const date = toDate(iso);
  return date ? jakartaTimeFormatter.format(date) : "-";
}

/** Pecah timestamp menjadi bagian tanggal untuk badge agenda. */
export function getJakartaDateParts(
  iso: string | null | undefined,
): { day: string; month: string; year: string } | null {
  const date = toDate(iso);
  if (!date) return null;

  const parts = jakartaDayMonthFormatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return { day: get("day"), month: get("month"), year: get("year") };
}

/**
 * Ubah nilai <input type="datetime-local"> (WIB) menjadi ISO UTC.
 * Contoh: "2026-11-01T19:00" -> "2026-11-01T12:00:00.000Z".
 */
export function wibInputToIso(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  const hasOffset = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(trimmed);
  const withSeconds = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed)
    ? `${trimmed}:00`
    : trimmed;
  const normalized = hasOffset ? withSeconds : `${withSeconds}+07:00`;

  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** ISO UTC -> nilai untuk <input type="datetime-local"> dalam WIB. */
export function isoToWibInput(iso: string | null | undefined): string {
  const date = toDate(iso);
  if (!date) return "";

  const parts = jakartaPartsFormatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}
