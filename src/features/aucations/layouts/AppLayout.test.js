import { describe, it, expect, vi } from "vitest";
import { h } from "vue";
import AppLayout from "./AppLayout.vue";
import { useAuthStore } from "../../auth/states/authStore";
import { showConfirmDialog } from "../../../helpers/toolsHelper";
import { renderWithProviders, flushPromises } from "../../../test-utils";

vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal()),
  showConfirmDialog: vi.fn(),
}));

const Child = { render: () => h("p", "isi halaman anak") };
const routes = ["/", "/users", "/profile"].map((path) => ({
  path,
  component: Child,
}));

const byId = (wrapper, id) => wrapper.find(`[data-testid="${id}"]`);

const setup = async () => {
  const { wrapper, router, pinia } = await renderWithProviders(AppLayout, {
    routes,
  });
  const authStore = useAuthStore(pinia);
  const logoutSpy = vi.spyOn(authStore, "logout").mockResolvedValue(true);
  const pushSpy = vi.spyOn(router, "push").mockResolvedValue();
  return { wrapper, logoutSpy, pushSpy };
};

describe("AppLayout", () => {
  it("menampilkan navbar dan konten halaman anak", async () => {
    const { wrapper } = await setup();

    expect(wrapper.text()).toContain("Delcom Auction");
    expect(wrapper.text()).toContain("isi halaman anak");
    expect(byId(wrapper, "nav-aucations").attributes("href")).toBe("/");
    expect(byId(wrapper, "nav-users").attributes("href")).toBe("/users");
    expect(byId(wrapper, "nav-profile").attributes("href")).toBe("/profile");
  });

  it("logout: konfirmasi diterima, token dihapus, diarahkan ke halaman login", async () => {
    showConfirmDialog.mockResolvedValue(true);
    const { wrapper, logoutSpy, pushSpy } = await setup();

    await byId(wrapper, "logout-button").trigger("click");
    await flushPromises();

    expect(showConfirmDialog).toHaveBeenCalledWith("Yakin ingin keluar dari akun?");
    expect(logoutSpy).toHaveBeenCalledTimes(1);
    expect(pushSpy).toHaveBeenCalledWith("/auth/login");
  });

  it("logout dibatalkan: tidak ada yang berubah", async () => {
    showConfirmDialog.mockResolvedValue(false);
    const { wrapper, logoutSpy, pushSpy } = await setup();

    await byId(wrapper, "logout-button").trigger("click");
    await flushPromises();

    expect(logoutSpy).not.toHaveBeenCalled();
    expect(pushSpy).not.toHaveBeenCalled();
  });
});