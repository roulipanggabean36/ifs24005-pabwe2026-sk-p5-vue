import { describe, it, expect, vi } from "vitest";
import AucationFormModal from "./AucationFormModal.vue";
import { useAucationsStore } from "../states/aucationsStore";
import { renderWithProviders, flushPromises } from "../../../test-utils";

// Editor toast-ui diganti textarea sederhana agar mudah diuji
vi.mock("../components/DescriptionEditor.vue", async () => {
  const { defineComponent, h } = await import("vue");

  return {
    default: defineComponent({
      props: ["modelValue"],
      emits: ["update:modelValue"],
      setup(props, { emit }) {
        return () =>
          h("textarea", {
            "data-testid": "description-input",
            value: props.modelValue,
            onInput: (event) => emit("update:modelValue", event.target.value),
          });
      },
    }),
  };
});

const byId = (wrapper, id) => wrapper.find(`[data-testid="${id}"]`);

const existing = {
  id: 5,
  title: "Oculus Quest 2",
  description: "Deskripsi lama",
  start_bid: 5000000,
  closed_at: "2999-12-31 22:00:00",
};

const setup = async (props = {}) => {
  const { wrapper, pinia } = await renderWithProviders(AucationFormModal, {
    props,
  });
  const store = useAucationsStore(pinia);
  return { wrapper, store };
};

const fill = async (
  wrapper,
  { title = "", description = "", startBid = "", closedAt = "" }
) => {
  await byId(wrapper, "title-input").setValue(title);
  await byId(wrapper, "description-input").setValue(description);
  await byId(wrapper, "start-bid-input").setValue(startBid);
  await byId(wrapper, "closed-at-input").setValue(closedAt);
};

const submit = async (wrapper) => {
  await byId(wrapper, "aucation-form").trigger("submit");
  await flushPromises();
};

const chooseCover = async (wrapper, files) => {
  const input = byId(wrapper, "cover-input");
  Object.defineProperty(input.element, "files", {
    value: files,
    configurable: true,
  });
  await input.trigger("change");
};

describe("AucationFormModal - tampilan", () => {
  it("mode tambah: judul modal dan form kosong", async () => {
    const { wrapper } = await setup();

    expect(wrapper.text()).toContain("Tambah lelang");
    expect(byId(wrapper, "title-input").element.value).toBe("");
    expect(byId(wrapper, "description-input").element.value).toBe("");
    expect(byId(wrapper, "start-bid-input").element.value).toBe("");
    expect(byId(wrapper, "closed-at-input").element.value).toBe("");
  });

  it("mode ubah: judul modal dan form terisi data lelang", async () => {
    const { wrapper } = await setup({ aucation: existing });

    expect(wrapper.text()).toContain("Ubah lelang");
    expect(byId(wrapper, "title-input").element.value).toBe("Oculus Quest 2");
    expect(byId(wrapper, "description-input").element.value).toBe("Deskripsi lama");
    expect(byId(wrapper, "start-bid-input").element.value).toBe("5000000");
    expect(byId(wrapper, "closed-at-input").element.value).toBe("2999-12-31T22:00");
  });

  it("tombol Batal dan tombol tutup memancarkan close", async () => {
    const { wrapper } = await setup();

    await byId(wrapper, "cancel-button").trigger("click");
    await byId(wrapper, "modal-close").trigger("click");

    expect(wrapper.emitted("close")).toHaveLength(2);
  });

  it("menonaktifkan tombol dan menampilkan loading saat menyimpan", async () => {
    const { wrapper, store } = await setup();

    expect(byId(wrapper, "submit-button").text()).toContain("Simpan");

    store.isAucationSaving = true;
    await flushPromises();

    const button = byId(wrapper, "submit-button");
    expect(button.attributes("disabled")).toBeDefined();
    expect(button.text()).toContain("Menyimpan...");
  });
});

describe("AucationFormModal - validasi", () => {
  it("menampilkan semua error jika form kosong", async () => {
    const { wrapper, store } = await setup();
    const spy = vi.spyOn(store, "createAucation").mockResolvedValue(true);

    await submit(wrapper);

    expect(byId(wrapper, "title-error").text()).toBe("Judul wajib diisi");
    expect(byId(wrapper, "description-error").text()).toBe("Deskripsi wajib diisi");
    expect(byId(wrapper, "start-bid-error").text()).toBe("Harga awal wajib diisi");
    expect(byId(wrapper, "closed-at-error").text()).toBe("Batas waktu wajib diisi");
    expect(spy).not.toHaveBeenCalled();
  });

  it("hanya judul yang terisi: error deskripsi dan lainnya tetap muncul", async () => {
    const { wrapper, store } = await setup();
    const spy = vi.spyOn(store, "createAucation").mockResolvedValue(true);

    await fill(wrapper, { title: "Judul" });
    await submit(wrapper);

    expect(byId(wrapper, "title-error").exists()).toBe(false);
    expect(byId(wrapper, "description-error").exists()).toBe(true);
    expect(spy).not.toHaveBeenCalled();
  });

  it("harga awal 0 ditolak", async () => {
    const { wrapper, store } = await setup();
    const spy = vi.spyOn(store, "createAucation").mockResolvedValue(true);

    await fill(wrapper, {
      title: "Judul",
      description: "Deskripsi",
      startBid: 0,
      closedAt: "2999-12-31T23:59",
    });
    await submit(wrapper);

    expect(byId(wrapper, "start-bid-error").text()).toBe(
      "Harga awal harus lebih dari 0"
    );
    expect(byId(wrapper, "closed-at-error").exists()).toBe(false);
    expect(spy).not.toHaveBeenCalled();
  });

  it("batas waktu di masa lalu ditolak", async () => {
    const { wrapper, store } = await setup();
    const spy = vi.spyOn(store, "createAucation").mockResolvedValue(true);

    await fill(wrapper, {
      title: "Judul",
      description: "Deskripsi",
      startBid: 10000,
      closedAt: "2000-01-01T00:00",
    });
    await submit(wrapper);

    expect(byId(wrapper, "start-bid-error").exists()).toBe(false);
    expect(byId(wrapper, "closed-at-error").text()).toBe(
      "Batas waktu harus di masa depan"
    );
    expect(spy).not.toHaveBeenCalled();
  });
});

describe("AucationFormModal - simpan", () => {
  it("mode tambah: memanggil createAucation lalu memancarkan saved", async () => {
    const { wrapper, store } = await setup();
    const spy = vi.spyOn(store, "createAucation").mockResolvedValue(true);

    await fill(wrapper, {
      title: "  Judul Baru  ",
      description: "Deskripsi baru",
      startBid: 10000,
      closedAt: "2999-12-31T23:59",
    });
    await submit(wrapper);

    expect(spy).toHaveBeenCalledWith({
      title: "Judul Baru",
      description: "Deskripsi baru",
      startBid: 10000,
      closedAt: "2999-12-31 23:59:00",
      cover: null,
    });
    expect(wrapper.emitted("saved")).toHaveLength(1);
  });

  it("menyertakan cover yang dipilih, dan null jika pilihan dibatalkan", async () => {
    const { wrapper, store } = await setup();
    const spy = vi.spyOn(store, "createAucation").mockResolvedValue(true);
    const file = new File(["x"], "cover.png", { type: "image/png" });

    await fill(wrapper, {
      title: "Judul",
      description: "Deskripsi",
      startBid: 10000,
      closedAt: "2999-12-31T23:59",
    });

    await chooseCover(wrapper, [file]);
    await submit(wrapper);
    expect(spy).toHaveBeenLastCalledWith(expect.objectContaining({ cover: file }));

    await chooseCover(wrapper, []);
    await submit(wrapper);
    expect(spy).toHaveBeenLastCalledWith(expect.objectContaining({ cover: null }));
  });

  it("mode ubah: memanggil updateAucation dengan id lelang", async () => {
    const { wrapper, store } = await setup({ aucation: existing });
    const spy = vi.spyOn(store, "updateAucation").mockResolvedValue(true);

    await submit(wrapper);

    expect(spy).toHaveBeenCalledWith(5, {
      title: "Oculus Quest 2",
      description: "Deskripsi lama",
      startBid: 5000000,
      closedAt: "2999-12-31 22:00:00",
      cover: null,
    });
    expect(wrapper.emitted("saved")).toHaveLength(1);
  });

  it("gagal menyimpan: tidak memancarkan saved", async () => {
    const { wrapper, store } = await setup();
    vi.spyOn(store, "createAucation").mockResolvedValue(false);

    await fill(wrapper, {
      title: "Judul",
      description: "Deskripsi",
      startBid: 10000,
      closedAt: "2999-12-31T23:59",
    });
    await submit(wrapper);

    expect(wrapper.emitted("saved")).toBeUndefined();
  });

  it("mode ubah gagal menyimpan: tidak memancarkan saved", async () => {
    const { wrapper, store } = await setup({ aucation: existing });
    const spy = vi.spyOn(store, "updateAucation").mockResolvedValue(false);

    await submit(wrapper);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(wrapper.emitted("saved")).toBeUndefined();
  });
});