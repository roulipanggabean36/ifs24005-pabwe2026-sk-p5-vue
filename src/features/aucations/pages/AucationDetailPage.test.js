import { describe, it, expect, vi } from "vitest";
import { h } from "vue";
import AucationDetailPage from "./AucationDetailPage.vue";
import { getAucationById, removeAucation, removeBid } from "../api/aucationsApi";
import { getProfile } from "../../users/api/usersApi";
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

vi.mock("../../users/api/usersApi", () => ({
  getUsers: vi.fn(),
  getUserById: vi.fn(),
  getProfile: vi.fn(),
  putProfile: vi.fn(),
  postProfilePhoto: vi.fn(),
  putPassword: vi.fn(),
}));

vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal()),
  showConfirmDialog: vi.fn(),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

vi.mock("../components/DescriptionViewer.vue", async () => {
  const { defineComponent, h: render } = await import("vue");

  return {
    default: defineComponent({
      props: ["value"],
      setup(props) {
        return () =>
          render("div", { "data-testid": "description-viewer" }, props.value);
      },
    }),
  };
});

const { makeModalStub } = vi.hoisted(() => ({
  makeModalStub: (testId) => async () => {
    const { defineComponent, h: render } = await import("vue");

    return {
      default: defineComponent({
        inheritAttrs: false,
        emits: ["close", "saved"],
        setup(_, { emit }) {
          return () =>
            render("div", { "data-testid": testId }, [
              render("button", {
                "data-testid": testId + "-close",
                onClick: () => emit("close"),
              }),
              render("button", {
                "data-testid": testId + "-saved",
                onClick: () => emit("saved"),
              }),
            ]);
        },
      }),
    };
  },
}));

vi.mock("../modals/AucationFormModal.vue", makeModalStub("edit-modal"));
vi.mock("../modals/BidModal.vue", makeModalStub("bid-modal"));

const normalize = (text) => text.replace(/\u00a0/g, " ");
const byId = (wrapper, id) => wrapper.find(`[data-testid="${id}"]`);

const makeAucation = (overrides = {}) => ({
  id: 2,
  user_id: 9,
  title: "Oculus Quest 2",
  cover: "https://cdn.example.com/cover.jpeg",
  description: "Barang **mulus**",
  start_bid: 5000000,
  closed_at: "2999-12-31 22:00:00",
  author: { name: "Abdullah Ubaid", photo: null },
  bids: [
    { id: 1, bid: 6000000, created_at: "2024-10-05T08:44:12.000000Z" },
    { id: 2, bid: 7000000, created_at: "2024-10-05T09:44:12.000000Z" },
  ],
  my_bid: null,
  ...overrides,
});

const setup = async ({ aucation = makeAucation(), profileId = 1 } = {}) => {
  getAucationById.mockResolvedValue({ success: true, data: { aucation } });
  getProfile.mockResolvedValue({
    success: true,
    data: { user: { id: profileId } },
  });

  const { wrapper, router } = await renderWithProviders(AucationDetailPage, {
    routes: [
      { path: "/aucations/:id", component: AucationDetailPage },
      { path: "/", component: { render: () => h("div") } },
    ],
    route: "/aucations/2",
  });
  const pushSpy = vi.spyOn(router, "push").mockResolvedValue();

  return { wrapper, pushSpy };
};

describe("AucationDetailPage - tampilan", () => {
  it("memuat lelang berdasarkan id rute dan menampilkan detailnya", async () => {
    const { wrapper } = await setup();

    expect(getAucationById).toHaveBeenCalledWith("2");
    expect(getProfile).toHaveBeenCalledTimes(1);
    expect(byId(wrapper, "aucation-title").text()).toBe("Oculus Quest 2");
    expect(byId(wrapper, "aucation-author").text()).toContain("Abdullah Ubaid");
    expect(byId(wrapper, "aucation-cover").attributes("src")).toBe(
      "https://cdn.example.com/cover.jpeg"
    );
    expect(normalize(byId(wrapper, "start-bid").text())).toBe("Rp 5.000.000");
    expect(normalize(byId(wrapper, "highest-bid").text())).toBe("Rp 7.000.000");
    expect(byId(wrapper, "closed-at").text()).toContain("Desember 2999");
    expect(byId(wrapper, "description-viewer").text()).toBe("Barang **mulus**");
    expect(byId(wrapper, "back-link").attributes("href")).toBe("/");
    expect(byId(wrapper, "status-badge").text()).toBe("Dibuka");
  });

  it("menampilkan riwayat penawaran dari yang tertinggi", async () => {
    const { wrapper } = await setup();

    const items = wrapper.findAll('[data-testid="bid-item"]');
    expect(items).toHaveLength(2);
    expect(normalize(items[0].text())).toContain("Rp 7.000.000");
    expect(normalize(items[1].text())).toContain("Rp 6.000.000");
    expect(byId(wrapper, "no-bids").exists()).toBe(false);
  });

  it("tanpa cover dan tanpa penawaran: ikon cadangan dan pesan kosong", async () => {
    const { wrapper } = await setup({
      aucation: makeAucation({ cover: null, bids: [] }),
    });

    expect(byId(wrapper, "aucation-cover").exists()).toBe(false);
    expect(byId(wrapper, "aucation-cover-fallback").exists()).toBe(true);
    expect(byId(wrapper, "highest-bid").text()).toBe("Belum ada tawaran");
    expect(byId(wrapper, "no-bids").exists()).toBe(true);
    expect(byId(wrapper, "bid-list").exists()).toBe(false);
  });

  it("menampilkan indikator loading saat data dimuat", async () => {
    getAucationById.mockReturnValue(new Promise(() => {}));
    getProfile.mockResolvedValue({ success: true, data: { user: { id: 1 } } });

    const { wrapper } = await renderWithProviders(AucationDetailPage, {
      routes: [{ path: "/aucations/:id", component: AucationDetailPage }],
      route: "/aucations/2",
    });

    expect(byId(wrapper, "aucation-loading").exists()).toBe(true);
  });

  it("menampilkan pesan tidak ditemukan dan dialog error jika gagal", async () => {
    getAucationById.mockResolvedValue({
      success: false,
      message: "Lelang tidak ada",
      data: null,
    });
    getProfile.mockResolvedValue({ success: true, data: { user: { id: 1 } } });

    const { wrapper } = await renderWithProviders(AucationDetailPage, {
      routes: [{ path: "/aucations/:id", component: AucationDetailPage }],
      route: "/aucations/2",
    });

    expect(byId(wrapper, "aucation-not-found").exists()).toBe(true);
    expect(showErrorDialog).toHaveBeenCalledWith("Lelang tidak ada");
  });
});

describe("AucationDetailPage - pemilik lelang", () => {
  it("pemilik melihat tombol ubah/hapus dan tidak bisa menawar", async () => {
    const { wrapper } = await setup({ profileId: 9 });

    expect(byId(wrapper, "edit-button").exists()).toBe(true);
    expect(byId(wrapper, "delete-button").exists()).toBe(true);
    expect(byId(wrapper, "bid-button").exists()).toBe(false);
    expect(byId(wrapper, "closed-notice").exists()).toBe(false);
  });

  it("bukan pemilik tidak melihat tombol ubah/hapus", async () => {
    const { wrapper } = await setup({ profileId: 1 });

    expect(byId(wrapper, "edit-button").exists()).toBe(false);
    expect(byId(wrapper, "delete-button").exists()).toBe(false);
  });

  it("profil gagal dimuat: diperlakukan bukan pemilik", async () => {
    getAucationById.mockResolvedValue({
      success: true,
      data: { aucation: makeAucation() },
    });
    getProfile.mockResolvedValue({ success: false, message: "x", data: null });

    const { wrapper } = await renderWithProviders(AucationDetailPage, {
      routes: [{ path: "/aucations/:id", component: AucationDetailPage }],
      route: "/aucations/2",
    });

    expect(byId(wrapper, "edit-button").exists()).toBe(false);
    expect(byId(wrapper, "bid-button").exists()).toBe(true);
  });

  it("hapus lelang dikonfirmasi dan berhasil: kembali ke beranda", async () => {
    showConfirmDialog.mockResolvedValue(true);
    removeAucation.mockResolvedValue({ success: true, message: "Dihapus" });
    const { wrapper, pushSpy } = await setup({ profileId: 9 });

    await byId(wrapper, "delete-button").trigger("click");
    await flushPromises();

    expect(removeAucation).toHaveBeenCalledWith(2);
    expect(pushSpy).toHaveBeenCalledWith("/");
  });

  it("hapus lelang dibatalkan: tidak ada yang dihapus", async () => {
    showConfirmDialog.mockResolvedValue(false);
    const { wrapper, pushSpy } = await setup({ profileId: 9 });

    await byId(wrapper, "delete-button").trigger("click");
    await flushPromises();

    expect(removeAucation).not.toHaveBeenCalled();
    expect(pushSpy).not.toHaveBeenCalled();
  });

  it("hapus lelang gagal: tidak berpindah halaman", async () => {
    showConfirmDialog.mockResolvedValue(true);
    removeAucation.mockResolvedValue({ success: false, message: "Ditolak" });
    const { wrapper, pushSpy } = await setup({ profileId: 9 });

    await byId(wrapper, "delete-button").trigger("click");
    await flushPromises();

    expect(pushSpy).not.toHaveBeenCalled();
  });

  it("modal ubah: close menutup, saved menutup dan memuat ulang", async () => {
    const { wrapper } = await setup({ profileId: 9 });
    expect(byId(wrapper, "edit-modal").exists()).toBe(false);

    await byId(wrapper, "edit-button").trigger("click");
    expect(byId(wrapper, "edit-modal").exists()).toBe(true);

    await byId(wrapper, "edit-modal-close").trigger("click");
    expect(byId(wrapper, "edit-modal").exists()).toBe(false);

    const callsBefore = getAucationById.mock.calls.length;
    await byId(wrapper, "edit-button").trigger("click");
    await byId(wrapper, "edit-modal-saved").trigger("click");
    await flushPromises();

    expect(byId(wrapper, "edit-modal").exists()).toBe(false);
    expect(getAucationById).toHaveBeenCalledTimes(callsBefore + 1);
  });
});

describe("AucationDetailPage - penawaran", () => {
  const myBid = {
    id: 5,
    bid: 8000000,
    created_at: "2024-10-05T10:00:00.000000Z",
  };

  it("belum punya tawaran: tombol Beri tawaran tanpa tombol hapus tawaran", async () => {
    const { wrapper } = await setup();

    expect(byId(wrapper, "bid-button").text()).toBe("Beri tawaran");
    expect(byId(wrapper, "my-bid").exists()).toBe(false);
    expect(byId(wrapper, "delete-bid-button").exists()).toBe(false);
  });

  it("sudah punya tawaran: tombol Ubah tawaran dan Hapus tawaran", async () => {
    const { wrapper } = await setup({
      aucation: makeAucation({ my_bid: myBid }),
    });

    expect(byId(wrapper, "bid-button").text()).toBe("Ubah tawaran");
    expect(normalize(byId(wrapper, "my-bid").text())).toContain("Rp 8.000.000");
    expect(byId(wrapper, "delete-bid-button").exists()).toBe(true);
  });

  it("lelang ditutup dan bukan pemilik: tampil pemberitahuan tanpa tombol tawar", async () => {
    const { wrapper } = await setup({
      aucation: makeAucation({ closed_at: "2000-01-01 10:00:00" }),
    });

    expect(byId(wrapper, "closed-notice").exists()).toBe(true);
    expect(byId(wrapper, "bid-button").exists()).toBe(false);
    expect(byId(wrapper, "status-badge").text()).toBe("Ditutup");
  });

  it("modal tawaran: close menutup, saved menutup dan memuat ulang", async () => {
    const { wrapper } = await setup();
    expect(byId(wrapper, "bid-modal").exists()).toBe(false);

    await byId(wrapper, "bid-button").trigger("click");
    expect(byId(wrapper, "bid-modal").exists()).toBe(true);

    await byId(wrapper, "bid-modal-close").trigger("click");
    expect(byId(wrapper, "bid-modal").exists()).toBe(false);

    const callsBefore = getAucationById.mock.calls.length;
    await byId(wrapper, "bid-button").trigger("click");
    await byId(wrapper, "bid-modal-saved").trigger("click");
    await flushPromises();

    expect(byId(wrapper, "bid-modal").exists()).toBe(false);
    expect(getAucationById).toHaveBeenCalledTimes(callsBefore + 1);
  });

  it("hapus tawaran dikonfirmasi dan berhasil: memuat ulang lelang", async () => {
    showConfirmDialog.mockResolvedValue(true);
    removeBid.mockResolvedValue({ success: true, message: "Tawaran dihapus" });
    const { wrapper } = await setup({
      aucation: makeAucation({ my_bid: myBid }),
    });
    const callsBefore = getAucationById.mock.calls.length;

    await byId(wrapper, "delete-bid-button").trigger("click");
    await flushPromises();

    expect(removeBid).toHaveBeenCalledWith(2);
    expect(getAucationById).toHaveBeenCalledTimes(callsBefore + 1);
  });

  it("hapus tawaran dibatalkan: tidak memanggil API", async () => {
    showConfirmDialog.mockResolvedValue(false);
    const { wrapper } = await setup({
      aucation: makeAucation({ my_bid: myBid }),
    });

    await byId(wrapper, "delete-bid-button").trigger("click");
    await flushPromises();

    expect(removeBid).not.toHaveBeenCalled();
  });

  it("hapus tawaran gagal: lelang tidak dimuat ulang", async () => {
    showConfirmDialog.mockResolvedValue(true);
    removeBid.mockResolvedValue({ success: false, message: "Ditolak" });
    const { wrapper } = await setup({
      aucation: makeAucation({ my_bid: myBid }),
    });
    const callsBefore = getAucationById.mock.calls.length;

    await byId(wrapper, "delete-bid-button").trigger("click");
    await flushPromises();

    expect(getAucationById).toHaveBeenCalledTimes(callsBefore);
  });
});