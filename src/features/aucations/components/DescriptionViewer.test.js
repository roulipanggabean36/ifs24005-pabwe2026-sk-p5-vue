import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import DescriptionViewer from "./DescriptionViewer.vue";

const { instances } = vi.hoisted(() => ({ instances: [] }));

vi.mock("@toast-ui/editor/dist/toastui-editor-viewer", () => ({
  default: class FakeViewer {
    constructor(options) {
      this.options = options;
      this.markdown = options.initialValue;
      this.destroyed = false;
      instances.push(this);
    }

    setMarkdown(value) {
      this.markdown = value;
    }

    destroy() {
      this.destroyed = true;
    }
  },
}));

describe("DescriptionViewer", () => {
  beforeEach(() => {
    instances.length = 0;
  });

  it("membuat viewer dengan nilai awal pada elemen container", () => {
    const wrapper = mount(DescriptionViewer, { props: { value: "**tebal**" } });

    expect(instances).toHaveLength(1);
    expect(instances[0].options.el).toBe(wrapper.element);
    expect(instances[0].options.initialValue).toBe("**tebal**");
  });

  it("memakai string kosong sebagai nilai awal default", () => {
    mount(DescriptionViewer);

    expect(instances[0].options.initialValue).toBe("");
  });

  it("memperbarui isi viewer saat prop berubah", async () => {
    const wrapper = mount(DescriptionViewer, { props: { value: "lama" } });

    await wrapper.setProps({ value: "baru" });

    expect(instances[0].markdown).toBe("baru");
  });

  it("menghancurkan viewer saat komponen dilepas", () => {
    const wrapper = mount(DescriptionViewer);

    wrapper.unmount();

    expect(instances[0].destroyed).toBe(true);
  });
});