import { describe, it, expect, vi } from "vitest";
import BidModal from "./BidModal.vue";
import { useAucationsStore } from "../states/aucationsStore";
import { renderWithProviders, flushPromises } from "../../../test-utils";

const byId = (wrapper, id) => wrapper.find(`[data-testid="${id}"]`);
const normalize = (text) => text.replace(/\u00a0/g, " ");

const setup = async (props = {}) => {
  const { wrapper, pinia } = await renderWithProviders(BidModal, {
    props: { aucationId: 4, minBid: 5000000, ...props },
  });
  const store = useAucationsStore(pinia);
  return { wrapper, store };
};

const submit = async (wrapper) => {
  await byId(wrapper, "bid-form").trigger("submit");
  await flushPromises();
};

describe("BidModal", () => {
  it("menampilkan form kosong dan petunjuk tawaran minimal", async () => {
    const { wrapper } = await setup();

    expect(wrapper.text()).toContain("Beri tawaran");
    expect(normalize(wrapper.text())).toContain("Tawaran minimal Rp 5.000.000");
    expect(byId(wrapper, "bid-input").element.value).toBe("");
    expect(byId(wrapper, "bid-error").exists()).toBe(false);
  });

  it("mengisi nominal awal jika initialBid diberikan", async () => {
    const { wrapper } = await setup({ initialBid: 7000000 });

    expect(byId(wrapper, "bid-input").element.value).toBe("7000000");
  });

  it("menampilkan error jika nominal kosong", async () => {
    const { wrapper, store } = await setup();
    const spy = vi.spyOn(store, "placeBid").mockResolvedValue(true);

    await submit(wrapper);

    expect(byId(wrapper, "bid-error").text()).toBe("Nominal tawaran wajib diisi");
    expect(spy).not.toHaveBeenCalled();
  });

  it("menampilkan error jika nominal di bawah minimum", async () => {
    const { wrapper, store } = await setup();
    const spy = vi.spyOn(store, "placeBid").mockResolvedValue(true);

    await byId(wrapper, "bid-input").setValue(1000);
    await submit(wrapper);

    expect(normalize(byId(wrapper, "bid-error").text())).toBe(
      "Tawaran minimal Rp 5.000.000"
    );
    expect(spy).not.toHaveBeenCalled();
  });

  it("berhasil: memanggil placeBid dan memancarkan saved", async () => {
    const { wrapper, store } = await setup();
    const spy = vi.spyOn(store, "placeBid").mockResolvedValue(true);

    await byId(wrapper, "bid-input").setValue(6000000);
    await submit(wrapper);

    expect(spy).toHaveBeenCalledWith(4, 6000000);
    expect(wrapper.emitted("saved")).toHaveLength(1);
    expect(byId(wrapper, "bid-error").exists()).toBe(false);
  });

  it("gagal: tidak memancarkan saved", async () => {
    const { wrapper, store } = await setup();
    vi.spyOn(store, "placeBid").mockResolvedValue(false);

    await byId(wrapper, "bid-input").setValue(6000000);
    await submit(wrapper);

    expect(wrapper.emitted("saved")).toBeUndefined();
  });

  it("tombol Batal dan tombol tutup memancarkan close", async () => {
    const { wrapper } = await setup();

    await byId(wrapper, "cancel-button").trigger("click");
    await byId(wrapper, "modal-close").trigger("click");

    expect(wrapper.emitted("close")).toHaveLength(2);
  });

  it("menonaktifkan tombol dan menampilkan loading saat mengirim", async () => {
    const { wrapper, store } = await setup();

    expect(byId(wrapper, "submit-button").text()).toContain("Kirim tawaran");

    store.isBidSaving = true;
    await flushPromises();

    const button = byId(wrapper, "submit-button");
    expect(button.attributes("disabled")).toBeDefined();
    expect(button.text()).toContain("Mengirim...");
  });
});