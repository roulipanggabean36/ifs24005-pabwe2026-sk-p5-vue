import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import BaseModal from "./BaseModal.vue";

const render = () =>
  mount(BaseModal, {
    props: { title: "Judul Modal" },
    slots: { default: "<p data-testid=\"slot-content\">Isi modal</p>" },
  });

describe("BaseModal", () => {
  it("menampilkan judul dan isi slot", () => {
    const wrapper = render();

    expect(wrapper.text()).toContain("Judul Modal");
    expect(wrapper.find('[data-testid="slot-content"]').exists()).toBe(true);
    expect(
      wrapper.find('[data-testid="modal-dialog"]').attributes("aria-label")
    ).toBe("Judul Modal");
  });

  it("memancarkan close saat tombol tutup diklik", async () => {
    const wrapper = render();

    await wrapper.find('[data-testid="modal-close"]').trigger("click");

    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("memancarkan close saat latar belakang diklik", async () => {
    const wrapper = render();

    await wrapper.find('[data-testid="modal-overlay"]').trigger("click");

    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("tidak menutup saat isi dialog diklik", async () => {
    const wrapper = render();

    await wrapper.find('[data-testid="modal-dialog"]').trigger("click");

    expect(wrapper.emitted("close")).toBeUndefined();
  });

  it("memancarkan close saat tombol Escape ditekan", () => {
    const wrapper = render();

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("mengabaikan tombol selain Escape", () => {
    const wrapper = render();

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

    expect(wrapper.emitted("close")).toBeUndefined();
  });

  it("melepas listener keyboard saat dilepas dari DOM", () => {
    const wrapper = render();

    wrapper.unmount();
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

    expect(wrapper.emitted("close")).toBeUndefined();
  });
});