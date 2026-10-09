import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import UserAvatar from "./UserAvatar.vue";

describe("UserAvatar", () => {
  it("menampilkan gambar dengan URL yang sudah di-resolve", () => {
    const wrapper = mount(UserAvatar, {
      props: { photo: "img/profile/1.png", name: "Rouli" },
    });

    const image = wrapper.find('[data-testid="avatar-image"]');
    expect(image.attributes("src")).toBe(
      "https://open-api.delcom.org/img/profile/1.png"
    );
    expect(image.attributes("alt")).toBe("Foto Rouli");
    expect(wrapper.find('[data-testid="avatar-fallback"]').exists()).toBe(false);
  });

  it("menampilkan ikon cadangan jika foto kosong", () => {
    const wrapper = mount(UserAvatar);

    expect(wrapper.find('[data-testid="avatar-fallback"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="avatar-image"]').exists()).toBe(false);
  });

  it("menampilkan ikon cadangan jika foto null", () => {
    const wrapper = mount(UserAvatar, { props: { photo: null } });

    expect(wrapper.find('[data-testid="avatar-fallback"]').exists()).toBe(true);
  });

  it("memakai sizeClass kustom dan default", () => {
    const custom = mount(UserAvatar, { props: { sizeClass: "size-24" } });
    expect(custom.find('[data-testid="avatar-fallback"]').classes()).toContain(
      "size-24"
    );

    const withDefault = mount(UserAvatar);
    expect(
      withDefault.find('[data-testid="avatar-fallback"]').classes()
    ).toContain("size-12");
  });
});