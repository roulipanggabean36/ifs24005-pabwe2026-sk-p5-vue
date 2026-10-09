import { describe, it, expect } from "vitest";
import { useInput } from "./useInput";

describe("useInput", () => {
  it("memakai string kosong sebagai nilai awal default", () => {
    const [value] = useInput();
    expect(value.value).toBe("");
  });

  it("memakai nilai awal yang diberikan", () => {
    const [value] = useInput("halo");
    expect(value.value).toBe("halo");
  });

  it("onChange memperbarui nilai dari event input", () => {
    const [value, onChange] = useInput();
    onChange({ target: { value: "lelang baru" } });
    expect(value.value).toBe("lelang baru");
  });

  it("nilai dapat diubah langsung (two-way binding)", () => {
    const [value] = useInput("a");
    value.value = "b";
    expect(value.value).toBe("b");
  });

  it("reset mengembalikan ke nilai awal", () => {
    const [value, onChange, reset] = useInput("awal");
    onChange({ target: { value: "berubah" } });
    reset();
    expect(value.value).toBe("awal");
  });
});