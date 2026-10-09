import { describe, it, expect, vi } from "vitest";
import AucationsPage from "./AucationsPage.vue";
import { getAucations, removeAllAucations } from "../api/aucationsApi";
import {
  showConfirmDialog,
  showErrorDialog,
} from "../../../helpers/toolsHelper";
import { renderWithProviders, flushPromises } from "../../../test-utils";

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

vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal()),
  showConfirmDialog: vi.fn(),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

// Modal form diganti stub yang bisa memancarkan close/saved
vi.mock("../modals/AucationFormModal.vue", async () => {
  const { defineComponent, h } = await import("vue");

  return {
    default: defineComponent({
      emits: ["close", "saved"],
      setup(_, { emit }) {
        return () =>
          h("div", { "data-testid": "form-modal-stub" }, [
            h("button", {
              "data-testid": "stub-close",
              onClick: () => emit("close"),
            }),
            h("button", {
              "data-testid": "stub-saved",
              onClick: () => emit("saved"),
            }),
          ]);
      },
    }),
  };
});

const openAucation = {
  id: 1,
  user_id: 1,
  title: "Oculus Quest 2",
  cover: "https://cdn.example.com/1.jpeg",
  start_bid: 5000000,
  closed_at: "2999-12-31 22:00:00",
  author: { name: "Abdullah Ubaid", photo: null },
  bids: [2],
};

const closedAucation = {
  id: 2,
  user_id: 2,
  title: "Keyboard Gaming RGB",
  cover: null,
  start_bid: 200000,
  closed_at: "2000-01-01 10:00:00",
  author: { name: "Delcom Testing", photo: null },
  bids: [],
};

const byId = (wrapper, id) => wrapper.find(`[data-testid="${id}"]`);
const cards = (wrapper) => wrapper.findAll('[data-testid="aucation-card"]');

const setup = async (
  response = {
    success: true,
    data: { aucations: [openAucation, closedAucation] },
  }
) => {
  getAucations.mockResolvedValue(response);
  return renderWithProviders(AucationsPage);
};

describe("AucationsPage - daftar", () => {
  it("memuat dan menampilkan semua lelang", async () => {
    const { wrapper } = await setup();

    expect(getAucations).toHaveBeenCalledWith({});
    expect(cards(wrapper)).toHaveLength(2);
    expect(wrapper.text()).toContain("Oculus Quest 2");
    expect(wrapper.text()).toContain("Keyboard Gaming RGB");
    expect(byId(wrapper, "aucations-empty").exists()).toBe(false);
  });

  it("menampilkan indikator loading saat data dimuat", async () => {
    getAucations.mockReturnValue(new Promise(() => {}));
    const { wrapper } = await renderWithProviders(AucationsPage);

    expect(byId(wrapper, "aucations-loading").exists()).toBe(true);
  });

  it("menampilkan pesan kosong jika tidak ada lelang", async () => {
    const { wrapper } = await setup({ success: true, data: { aucations: [] } });

    expect(byId(wrapper, "aucations-empty").exists()).toBe(true);
    expect(cards(wrapper)).toHaveLength(0);
  });

  it("menampilkan pesan kosong dan dialog error jika gagal memuat", async () => {
    const { wrapper } = await setup({
      success: false,
      message: "Gagal memuat",
      data: null,
    });

    expect(byId(wrapper, "aucations-empty").exists()).toBe(true);
    expect(showErrorDialog).toHaveBeenCalledWith("Gagal memuat");
  });
});

describe("AucationsPage - filter", () => {
  it("menyaring berdasarkan judul tanpa membedakan huruf besar/kecil", async () => {
    const { wrapper } = await setup();

    await byId(wrapper, "search-input").setValue("  KEYBOARD ");

    expect(cards(wrapper)).toHaveLength(1);
    expect(wrapper.text()).toContain("Keyboard Gaming RGB");
  });

  it("menampilkan pesan kosong jika judul tidak cocok", async () => {
    const { wrapper } = await setup();

    await byId(wrapper, "search-input").setValue("tidak-ada");

    expect(byId(wrapper, "aucations-empty").exists()).toBe(true);
  });

  it("menyaring berdasarkan status Dibuka, Ditutup, dan Semua", async () => {
    const { wrapper } = await setup();
    const select = byId(wrapper, "status-select");

    await select.setValue("open");
    expect(cards(wrapper)).toHaveLength(1);
    expect(wrapper.text()).toContain("Oculus Quest 2");

    await select.setValue("closed");
    expect(cards(wrapper)).toHaveLength(1);
    expect(wrapper.text()).toContain("Keyboard Gaming RGB");

    await select.setValue("all");
    expect(cards(wrapper)).toHaveLength(2);
  });

  it("tab Lelang saya memuat ulang dengan is_me=1 dan tab Semua tanpa params", async () => {
    const { wrapper } = await setup();

    await byId(wrapper, "scope-mine").trigger("click");
    await flushPromises();
    expect(getAucations).toHaveBeenLastCalledWith({ is_me: 1 });

    await byId(wrapper, "scope-all").trigger("click");
    await flushPromises();
    expect(getAucations).toHaveBeenLastCalledWith({});
  });
});

describe("AucationsPage - hapus semua", () => {
  const openMineTab = async (wrapper) => {
    await byId(wrapper, "scope-mine").trigger("click");
    await flushPromises();
  };

  it("tombol hanya muncul di tab Lelang saya yang berisi data", async () => {
    const { wrapper } = await setup();

    expect(byId(wrapper, "delete-all-button").exists()).toBe(false);

    await openMineTab(wrapper);
    expect(byId(wrapper, "delete-all-button").exists()).toBe(true);
  });

  it("tombol tidak muncul di tab Lelang saya jika daftar kosong", async () => {
    const { wrapper } = await setup({ success: true, data: { aucations: [] } });

    await openMineTab(wrapper);

    expect(byId(wrapper, "delete-all-button").exists()).toBe(false);
  });

  it("dikonfirmasi dan berhasil: menghapus lalu memuat ulang daftar", async () => {
    showConfirmDialog.mockResolvedValue(true);
    removeAllAucations.mockResolvedValue({ success: true, message: "Dihapus" });
    const { wrapper } = await setup();
    await openMineTab(wrapper);
    const callsBefore = getAucations.mock.calls.length;

    await byId(wrapper, "delete-all-button").trigger("click");
    await flushPromises();

    expect(removeAllAucations).toHaveBeenCalledTimes(1);
    expect(getAucations).toHaveBeenCalledTimes(callsBefore + 1);
  });

  it("dibatalkan: tidak menghapus apa pun", async () => {
    showConfirmDialog.mockResolvedValue(false);
    const { wrapper } = await setup();
    await openMineTab(wrapper);

    await byId(wrapper, "delete-all-button").trigger("click");
    await flushPromises();

    expect(removeAllAucations).not.toHaveBeenCalled();
  });

  it("gagal menghapus: daftar tidak dimuat ulang", async () => {
    showConfirmDialog.mockResolvedValue(true);
    removeAllAucations.mockResolvedValue({
      success: false,
      message: "Tidak berhak",
    });
    const { wrapper } = await setup();
    await openMineTab(wrapper);
    const callsBefore = getAucations.mock.calls.length;

    await byId(wrapper, "delete-all-button").trigger("click");
    await flushPromises();

    expect(getAucations).toHaveBeenCalledTimes(callsBefore);
  });
});

describe("AucationsPage - modal tambah lelang", () => {
  it("tombol Tambah lelang membuka modal dan close menutupnya", async () => {
    const { wrapper } = await setup();
    expect(byId(wrapper, "form-modal-stub").exists()).toBe(false);

    await byId(wrapper, "add-button").trigger("click");
    expect(byId(wrapper, "form-modal-stub").exists()).toBe(true);

    await byId(wrapper, "stub-close").trigger("click");
    expect(byId(wrapper, "form-modal-stub").exists()).toBe(false);
  });

  it("saved menutup modal dan memuat ulang daftar", async () => {
    const { wrapper } = await setup();
    const callsBefore = getAucations.mock.calls.length;

    await byId(wrapper, "add-button").trigger("click");
    await byId(wrapper, "stub-saved").trigger("click");
    await flushPromises();

    expect(byId(wrapper, "form-modal-stub").exists()).toBe(false);
    expect(getAucations).toHaveBeenCalledTimes(callsBefore + 1);
  });
});