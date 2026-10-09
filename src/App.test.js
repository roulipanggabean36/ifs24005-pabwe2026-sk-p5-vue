import { describe, it, expect } from "vitest";
import { h } from "vue";
import App from "./App.vue";
import { renderWithProviders } from "./test-utils";

describe("App", () => {
  it("merender halaman sesuai rute yang aktif", async () => {
    const { wrapper } = await renderWithProviders(App, {
      routes: [
        { path: "/", component: { render: () => h("p", "halaman beranda") } },
      ],
      route: "/",
    });

    expect(wrapper.text()).toContain("halaman beranda");
  });
});