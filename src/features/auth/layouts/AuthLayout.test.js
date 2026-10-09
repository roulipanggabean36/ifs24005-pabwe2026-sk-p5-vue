import { describe, it, expect } from "vitest";
import { h } from "vue";
import AuthLayout from "./AuthLayout.vue";
import { renderWithProviders } from "../../../test-utils";

describe("AuthLayout", () => {
  it("menampilkan banner dan konten halaman anak", async () => {
    const Child = { render: () => h("p", "isi halaman anak") };

    const { wrapper } = await renderWithProviders(AuthLayout, {
      routes: [{ path: "/", component: Child }],
    });

    expect(wrapper.find('[data-testid="auth-banner"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("Delcom Auction");
    expect(wrapper.text()).toContain("isi halaman anak");
  });
});