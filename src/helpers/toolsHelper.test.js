import { describe, it, expect, vi } from "vitest";
import Swal from "sweetalert2";
import {
  showSuccessDialog,
  showErrorDialog,
  showWarningDialog,
  showConfirmDialog,
  formatRupiah,
  formatDate,
} from "./toolsHelper";

vi.mock("sweetalert2", () => ({
  default: { fire: vi.fn() },
}));

// Intl memakai non-breaking space (U+00A0) pada format mata uang
const normalize = (text) => text.replace(/\u00a0/g, " ");

describe("toolsHelper - dialog", () => {
  it("showSuccessDialog menampilkan dialog sukses", async () => {
    Swal.fire.mockResolvedValue({});
    await showSuccessDialog("Data tersimpan");

    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: "success",
        title: "Berhasil",
        text: "Data tersimpan",
      })
    );
  });

  it("showErrorDialog menampilkan dialog error", async () => {
    Swal.fire.mockResolvedValue({});
    await showErrorDialog("Terjadi kesalahan");

    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: "error",
        title: "Gagal",
        text: "Terjadi kesalahan",
      })
    );
  });

  it("showWarningDialog menampilkan dialog peringatan", async () => {
    Swal.fire.mockResolvedValue({});
    await showWarningDialog("Periksa input");

    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: "warning",
        title: "Perhatian",
        text: "Periksa input",
      })
    );
  });

  it("showConfirmDialog mengembalikan true jika dikonfirmasi", async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: true });

    await expect(showConfirmDialog("Hapus lelang?")).resolves.toBe(true);
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: "question",
        text: "Hapus lelang?",
        showCancelButton: true,
      })
    );
  });

  it("showConfirmDialog mengembalikan false jika dibatalkan", async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: false });

    await expect(showConfirmDialog("Hapus lelang?")).resolves.toBe(false);
  });
});

describe("toolsHelper - formatRupiah", () => {
  it("memformat angka menjadi Rupiah", () => {
    expect(normalize(formatRupiah(1500000))).toBe("Rp 1.500.000");
  });

  it("memformat string angka", () => {
    expect(normalize(formatRupiah("25000"))).toBe("Rp 25.000");
  });

  it("menganggap nilai tidak valid sebagai 0", () => {
    expect(normalize(formatRupiah("abc"))).toBe("Rp 0");
    expect(normalize(formatRupiah(null))).toBe("Rp 0");
    expect(normalize(formatRupiah(undefined))).toBe("Rp 0");
  });
});

describe("toolsHelper - formatDate", () => {
  it("mengembalikan string kosong jika nilai kosong", () => {
    expect(formatDate("")).toBe("");
    expect(formatDate(null)).toBe("");
  });

  it("mengembalikan string kosong jika tanggal tidak valid", () => {
    expect(formatDate("bukan-tanggal")).toBe("");
  });

  it("memformat tanggal valid ke locale Indonesia", () => {
    const result = formatDate(new Date(2026, 9, 8, 14, 30));

    expect(result).toContain("8 Oktober 2026");
    expect(result).toMatch(/14[.:]30/);
  });
});