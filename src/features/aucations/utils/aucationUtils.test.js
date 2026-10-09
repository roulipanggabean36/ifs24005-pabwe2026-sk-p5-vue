import { describe, it, expect } from "vitest";
import {
  normalizeDateTime,
  isAucationClosed,
  getHighestBid,
  toApiDateTime,
  toInputDateTime,
} from "./aucationUtils";

describe("aucationUtils", () => {
  it("normalizeDateTime mengganti spasi dengan T", () => {
    expect(normalizeDateTime("2024-10-05 22:00:00")).toBe("2024-10-05T22:00:00");
    expect(normalizeDateTime("2024-10-05T22:00:00")).toBe("2024-10-05T22:00:00");
  });

  describe("isAucationClosed", () => {
    it("true jika batas waktu sudah lewat", () => {
      expect(isAucationClosed("2000-01-01 10:00:00")).toBe(true);
    });

    it("false jika batas waktu masih di masa depan", () => {
      expect(isAucationClosed("2999-12-31 23:59:59")).toBe(false);
    });

    it("memakai parameter now dan menganggap sama dengan now sebagai ditutup", () => {
      const closedAt = "2024-10-05 22:00:00";
      const exact = new Date("2024-10-05T22:00:00").getTime();

      expect(isAucationClosed(closedAt, exact)).toBe(true);
      expect(isAucationClosed(closedAt, exact - 1)).toBe(false);
    });
  });

  describe("getHighestBid", () => {
    it("mengembalikan 0 jika tidak ada bid", () => {
      expect(getHighestBid([])).toBe(0);
    });

    it("mengembalikan nominal terbesar", () => {
      expect(
        getHighestBid([{ bid: 5000 }, { bid: 9000 }, { bid: 7000 }])
      ).toBe(9000);
    });
  });

  it("toApiDateTime mengubah ke format API", () => {
    expect(toApiDateTime("2026-12-31T23:59")).toBe("2026-12-31 23:59:00");
  });

  describe("toInputDateTime", () => {
    it("mengembalikan string kosong jika nilai kosong", () => {
      expect(toInputDateTime("")).toBe("");
      expect(toInputDateTime(null)).toBe("");
    });

    it("mengubah format API ke format input", () => {
      expect(toInputDateTime("2024-10-05 22:00:00")).toBe("2024-10-05T22:00");
    });
  });
});