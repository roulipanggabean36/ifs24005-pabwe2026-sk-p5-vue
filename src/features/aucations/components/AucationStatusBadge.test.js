import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import AucationStatusBadge from "./AucationStatusBadge.vue";

describe("AucationStatusBadge", () => {
  it("menampilkan Dibuka jika batas waktu masih di masa depan", () => {
    const wrapper = mount(AucationStatusBadge, {
      props: { closedAt: "2999-12-31 23:59:59" },
    });

    expect(wrapper.text()).toBe("Dibuka");
    expect(wrapper.classes()).toContain("bg-emerald-100");
  });

  it("menampilkan Ditutup jika batas waktu sudah lewat", () => {
    const wrapper = mount(AucationStatusBadge, {
      props: { closedAt: "2000-01-01 10:00:00" },
    });

    expect(wrapper.text()).toBe("Ditutup");
    expect(wrapper.classes()).toContain("bg-slate-200");
  });
});