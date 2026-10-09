import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import DescriptionEditor from "./DescriptionEditor.vue";

const { instances } = vi.hoisted(() => ({ instances: [] }));

vi.mock("@toast-ui/editor", () => ({
  default: class FakeEditor {
    constructor(options) {
      this.options = options;
      this.markdown = options.initialValue;
      this.destroyed = false;
      instances.push(this);
    }

    getMarkdown() {
      return this.markdown;
    }

    setMarkdown(value) {
      this.markdown = value;
    }

    destroy() {
      this.destroyed = true;
    }
  },
}));

describe("DescriptionEditor", () => {
  beforeEach(() => {
    instances.length = 0;
  });

  it("membuat editor dengan nilai awal pada elemen container", () => {
    const wrapper = mount(DescriptionEditor, {
      props: { modelValue: "# Judul" },
    });

    expect(instances).toHaveLength(1);
    const [editor] = instances;
    expect(editor.options.el).toBe(wrapper.element);
    expect(editor.options.initialValue).toBe("# Judul");
    expect(editor.options.usageStatistics).toBe(false);
  });

  it("memakai string kosong sebagai nilai awal default", () => {
    mount(DescriptionEditor);

    expect(instances[0].options.initialValue).toBe("");
  });

  it("memancarkan update:modelValue saat isi editor berubah", () => {
    const wrapper = mount(DescriptionEditor, { props: { modelValue: "" } });
    const [editor] = instances;

    editor.markdown = "teks baru";
    editor.options.events.change();

    expect(wrapper.emitted("update:modelValue")).toEqual([["teks baru"]]);
  });

  it("memperbarui editor saat nilai dari luar berubah", async () => {
    const wrapper = mount(DescriptionEditor, { props: { modelValue: "awal" } });
    const [editor] = instances;

    await wrapper.setProps({ modelValue: "diubah dari luar" });

    expect(editor.markdown).toBe("diubah dari luar");
  });

  it("tidak mengatur ulang editor jika nilainya sama dengan isi editor", async () => {
    const wrapper = mount(DescriptionEditor, { props: { modelValue: "awal" } });
    const [editor] = instances;
    const setSpy = vi.spyOn(editor, "setMarkdown");

    editor.markdown = "diketik pengguna";
    await wrapper.setProps({ modelValue: "diketik pengguna" });

    expect(setSpy).not.toHaveBeenCalled();
  });

  it("menghancurkan editor saat komponen dilepas", () => {
    const wrapper = mount(DescriptionEditor);
    const [editor] = instances;

    wrapper.unmount();

    expect(editor.destroyed).toBe(true);
  });
});