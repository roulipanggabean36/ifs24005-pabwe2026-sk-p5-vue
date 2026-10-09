import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import {
  getAucationById,
  getAucations,
  postAucation,
  postAucationCover,
  postBid,
  putAucation,
  removeAllAucations,
  removeAucation,
  removeBid,
} from "../api/aucationsApi";
import {
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";
import { useAucationsStore } from "./aucationsStore";

vi.mock("../api/aucationsApi", () => ({
  getAucations: vi.fn(),
  getAucationById: vi.fn(),
  postAucation: vi.fn(),
  putAucation: vi.fn(),
  postAucationCover: vi.fn(),
  removeAucation: vi.fn(),
  removeAllAucations: vi.fn(),
  postBid: vi.fn(),
  removeBid: vi.fn(),
}));

vi.mock("../../../helpers/toolsHelper", () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const aucation = { id: 1, title: "Oculus Quest 2" };
const failure = { success: false, message: "Gagal memproses", data: null };
const payload = {
  title: "Judul",
  description: "Deskripsi",
  startBid: 10000,
  closedAt: "2999-12-31 23:59:00",
};
const file = new File(["x"], "cover.png", { type: "image/png" });

describe("aucationsStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("memiliki state awal yang kosong", () => {
    const store = useAucationsStore();

    expect(store.aucations).toEqual([]);
    expect(store.aucation).toBeNull();
    expect(store.isAucationsLoading).toBe(false);
    expect(store.isAucationLoading).toBe(false);
    expect(store.isAucationSaving).toBe(false);
    expect(store.isAucationDeleting).toBe(false);
    expect(store.isBidSaving).toBe(false);
    expect(store.isBidDeleting).toBe(false);
  });

  describe("fetchAucations", () => {
    it("berhasil tanpa params: mengisi aucations", async () => {
      getAucations.mockResolvedValue({
        success: true,
        data: { aucations: [aucation] },
      });
      const store = useAucationsStore();

      const result = await store.fetchAucations();

      expect(getAucations).toHaveBeenCalledWith({});
      expect(result).toBe(true);
      expect(store.aucations).toEqual([aucation]);
    });

    it("meneruskan params ke API", async () => {
      getAucations.mockResolvedValue({
        success: true,
        data: { aucations: [] },
      });
      const store = useAucationsStore();

      await store.fetchAucations({ is_me: 1 });

      expect(getAucations).toHaveBeenCalledWith({ is_me: 1 });
    });

    it("gagal: dialog error dan aucations tetap kosong", async () => {
      getAucations.mockResolvedValue(failure);
      const store = useAucationsStore();

      const result = await store.fetchAucations();

      expect(result).toBe(false);
      expect(store.aucations).toEqual([]);
      expect(showErrorDialog).toHaveBeenCalledWith("Gagal memproses");
    });
  });

  describe("fetchAucation", () => {
    it("berhasil: mengisi aucation", async () => {
      getAucationById.mockResolvedValue({ success: true, data: { aucation } });
      const store = useAucationsStore();

      const result = await store.fetchAucation(1);

      expect(getAucationById).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
      expect(store.aucation).toEqual(aucation);
    });

    it("gagal: mengosongkan aucation lama dan menampilkan error", async () => {
      getAucationById.mockResolvedValue(failure);
      const store = useAucationsStore();
      store.aucation = { id: 99 };

      const result = await store.fetchAucation(1);

      expect(result).toBe(false);
      expect(store.aucation).toBeNull();
      expect(showErrorDialog).toHaveBeenCalledWith("Gagal memproses");
    });
  });

  describe("createAucation", () => {
    it("tanpa cover: membuat lelang dan menampilkan dialog sukses", async () => {
      postAucation.mockResolvedValue({
        success: true,
        message: "Berhasil menambahkan data",
      });
      const store = useAucationsStore();

      const result = await store.createAucation({ ...payload, cover: null });

      expect(postAucation).toHaveBeenCalledWith(payload);
      expect(getAucations).not.toHaveBeenCalled();
      expect(postAucationCover).not.toHaveBeenCalled();
      expect(result).toBe(true);
      expect(showSuccessDialog).toHaveBeenCalledWith("Berhasil menambahkan data");
      expect(store.isAucationSaving).toBe(false);
    });

    it("gagal membuat: dialog error dan cover tidak diunggah", async () => {
      postAucation.mockResolvedValue(failure);
      const store = useAucationsStore();

      const result = await store.createAucation({ ...payload, cover: file });

      expect(result).toBe(false);
      expect(showErrorDialog).toHaveBeenCalledWith("Gagal memproses");
      expect(getAucations).not.toHaveBeenCalled();
      expect(showSuccessDialog).not.toHaveBeenCalled();
    });

    it("dengan cover: mengunggah ke lelang milik sendiri dengan id terbesar", async () => {
      postAucation.mockResolvedValue({ success: true, message: "Dibuat" });
      getAucations.mockResolvedValue({
        success: true,
        data: { aucations: [{ id: 3 }, { id: 7 }, { id: 5 }] },
      });
      postAucationCover.mockResolvedValue({ success: true });
      const store = useAucationsStore();

      const result = await store.createAucation({ ...payload, cover: file });

      expect(getAucations).toHaveBeenCalledWith({ is_me: 1 });
      expect(postAucationCover).toHaveBeenCalledWith(7, file);
      expect(result).toBe(true);
      expect(showSuccessDialog).toHaveBeenCalledWith("Dibuat");
      expect(showErrorDialog).not.toHaveBeenCalled();
    });

    it("cover gagal diunggah: dialog error dan tanpa dialog sukses", async () => {
      postAucation.mockResolvedValue({ success: true, message: "Dibuat" });
      getAucations.mockResolvedValue({
        success: true,
        data: { aucations: [{ id: 1 }] },
      });
      postAucationCover.mockResolvedValue({
        success: false,
        message: "Cover tidak valid",
      });
      const store = useAucationsStore();

      const result = await store.createAucation({ ...payload, cover: file });

      expect(result).toBe(true);
      expect(showErrorDialog).toHaveBeenCalledWith("Cover tidak valid");
      expect(showSuccessDialog).not.toHaveBeenCalled();
    });

    it("daftar lelang gagal dimuat: memakai pesan cadangan", async () => {
      postAucation.mockResolvedValue({ success: true, message: "Dibuat" });
      getAucations.mockResolvedValue(failure);
      const store = useAucationsStore();

      await store.createAucation({ ...payload, cover: file });

      expect(postAucationCover).not.toHaveBeenCalled();
      expect(showErrorDialog).toHaveBeenCalledWith(
        "Lelang berhasil dibuat, tetapi cover gagal diunggah"
      );
      expect(showSuccessDialog).not.toHaveBeenCalled();
    });

    it("daftar lelang kosong: memakai pesan cadangan", async () => {
      postAucation.mockResolvedValue({ success: true, message: "Dibuat" });
      getAucations.mockResolvedValue({
        success: true,
        data: { aucations: [] },
      });
      const store = useAucationsStore();

      await store.createAucation({ ...payload, cover: file });

      expect(postAucationCover).not.toHaveBeenCalled();
      expect(showErrorDialog).toHaveBeenCalledWith(
        "Lelang berhasil dibuat, tetapi cover gagal diunggah"
      );
    });
  });

  describe("updateAucation", () => {
    it("tanpa cover: mengubah lelang dan menampilkan dialog sukses", async () => {
      putAucation.mockResolvedValue({
        success: true,
        message: "Berhasil mengubah data",
      });
      const store = useAucationsStore();

      const result = await store.updateAucation(5, { ...payload, cover: null });

      expect(putAucation).toHaveBeenCalledWith(5, payload);
      expect(postAucationCover).not.toHaveBeenCalled();
      expect(result).toBe(true);
      expect(showSuccessDialog).toHaveBeenCalledWith("Berhasil mengubah data");
    });

    it("dengan cover: mengunggah cover ke id yang sama", async () => {
      putAucation.mockResolvedValue({ success: true, message: "Diubah" });
      postAucationCover.mockResolvedValue({ success: true });
      const store = useAucationsStore();

      await store.updateAucation(5, { ...payload, cover: file });

      expect(postAucationCover).toHaveBeenCalledWith(5, file);
      expect(showSuccessDialog).toHaveBeenCalledWith("Diubah");
    });

    it("cover gagal: dialog error tanpa dialog sukses", async () => {
      putAucation.mockResolvedValue({ success: true, message: "Diubah" });
      postAucationCover.mockResolvedValue({
        success: false,
        message: "Cover tidak valid",
      });
      const store = useAucationsStore();

      await store.updateAucation(5, { ...payload, cover: file });

      expect(showErrorDialog).toHaveBeenCalledWith("Cover tidak valid");
      expect(showSuccessDialog).not.toHaveBeenCalled();
    });

    it("gagal mengubah: dialog error dan mengembalikan false", async () => {
      putAucation.mockResolvedValue(failure);
      const store = useAucationsStore();

      const result = await store.updateAucation(5, { ...payload, cover: file });

      expect(result).toBe(false);
      expect(postAucationCover).not.toHaveBeenCalled();
      expect(showErrorDialog).toHaveBeenCalledWith("Gagal memproses");
    });
  });

  describe("aksi hapus dan bid", () => {
    it("deleteAucation berhasil: dialog sukses", async () => {
      removeAucation.mockResolvedValue({ success: true, message: "Dihapus" });
      const store = useAucationsStore();

      const result = await store.deleteAucation(3);

      expect(removeAucation).toHaveBeenCalledWith(3);
      expect(result).toBe(true);
      expect(showSuccessDialog).toHaveBeenCalledWith("Dihapus");
    });

    it("deleteAucation gagal: dialog error", async () => {
      removeAucation.mockResolvedValue(failure);
      const store = useAucationsStore();

      expect(await store.deleteAucation(3)).toBe(false);
      expect(showErrorDialog).toHaveBeenCalledWith("Gagal memproses");
    });

    it("deleteAllAucations berhasil: dialog sukses", async () => {
      removeAllAucations.mockResolvedValue({
        success: true,
        message: "Semua dihapus",
      });
      const store = useAucationsStore();

      expect(await store.deleteAllAucations()).toBe(true);
      expect(showSuccessDialog).toHaveBeenCalledWith("Semua dihapus");
    });

    it("placeBid berhasil: memanggil API dan dialog sukses", async () => {
      postBid.mockResolvedValue({ success: true, message: "Tawaran dikirim" });
      const store = useAucationsStore();

      const result = await store.placeBid(3, 9000000);

      expect(postBid).toHaveBeenCalledWith(3, 9000000);
      expect(result).toBe(true);
      expect(showSuccessDialog).toHaveBeenCalledWith("Tawaran dikirim");
    });

    it("placeBid gagal: dialog error", async () => {
      postBid.mockResolvedValue(failure);
      const store = useAucationsStore();

      expect(await store.placeBid(3, 1)).toBe(false);
      expect(showErrorDialog).toHaveBeenCalledWith("Gagal memproses");
    });

    it("deleteBid berhasil: dialog sukses", async () => {
      removeBid.mockResolvedValue({ success: true, message: "Tawaran dihapus" });
      const store = useAucationsStore();

      const result = await store.deleteBid(3);

      expect(removeBid).toHaveBeenCalledWith(3);
      expect(result).toBe(true);
      expect(showSuccessDialog).toHaveBeenCalledWith("Tawaran dihapus");
    });
  });

  describe("flag loading", () => {
    it.each([
      ["fetchAucations", "isAucationsLoading", getAucations, []],
      ["fetchAucation", "isAucationLoading", getAucationById, [1]],
      ["createAucation", "isAucationSaving", postAucation, [{ ...payload }]],
      ["updateAucation", "isAucationSaving", putAucation, [1, { ...payload }]],
      ["deleteAucation", "isAucationDeleting", removeAucation, [1]],
      ["deleteAllAucations", "isAucationDeleting", removeAllAucations, []],
      ["placeBid", "isBidSaving", postBid, [1, 10000]],
      ["deleteBid", "isBidDeleting", removeBid, [1]],
    ])("%s mengaktifkan %s selama proses", async (action, flag, api, args) => {
      let resolveRequest;
      api.mockReturnValue(
        new Promise((resolve) => {
          resolveRequest = resolve;
        })
      );
      const store = useAucationsStore();

      const promise = store[action](...args);
      expect(store[flag]).toBe(true);

      resolveRequest(failure);
      await promise;
      expect(store[flag]).toBe(false);
    });
  });
});