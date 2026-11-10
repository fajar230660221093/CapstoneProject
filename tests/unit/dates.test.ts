import { describe, expect, it } from "vitest";
import {
  formatTanggalWaktuJakarta,
  formatWaktuJakarta,
  getJakartaDateParts,
  isoToWibInput,
  wibInputToIso,
} from "@/lib/dates";

describe("konversi waktu agenda (WIB)", () => {
  it("mengubah input datetime-local WIB menjadi ISO UTC", () => {
    expect(wibInputToIso("2026-11-01T19:00")).toBe(
      "2026-11-01T12:00:00.000Z",
    );
    expect(wibInputToIso("")).toBeNull();
    expect(wibInputToIso("bukan-tanggal")).toBeNull();
  });

  it("mengubah ISO UTC kembali menjadi input WIB", () => {
    expect(isoToWibInput("2026-11-01T12:00:00.000Z")).toBe(
      "2026-11-01T19:00",
    );
    expect(isoToWibInput(null)).toBe("");
  });

  it("menampilkan waktu dalam zona Asia/Jakarta", () => {
    const iso = "2026-11-01T12:00:00.000Z";
    expect(formatWaktuJakarta(iso)).toBe("19.00");
    expect(formatTanggalWaktuJakarta(iso)).toContain("2026");
    expect(formatTanggalWaktuJakarta("bukan-tanggal")).toBe("-");
    expect(getJakartaDateParts(iso)).toMatchObject({
      day: "01",
      year: "2026",
    });
  });
});
