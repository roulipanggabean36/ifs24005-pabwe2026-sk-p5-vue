import { describe, it, expect } from "vitest";
import { resolvePhotoUrl } from "./photoUrl";

describe("resolvePhotoUrl", () => {
  it("mengembalikan string kosong jika foto kosong", () => {
    expect(resolvePhotoUrl("")).toBe("");
    expect(resolvePhotoUrl(null)).toBe("");
    expect(resolvePhotoUrl(undefined)).toBe("");
  });

  it("mengembalikan URL penuh apa adanya", () => {
    expect(resolvePhotoUrl("https://cdn.example.com/a.png")).toBe(
      "https://cdn.example.com/a.png"
    );
    expect(resolvePhotoUrl("http://cdn.example.com/a.png")).toBe(
      "http://cdn.example.com/a.png"
    );
  });

  it("menggabungkan path relatif dengan origin API", () => {
    expect(resolvePhotoUrl("img/profile/1.png")).toBe(
      "https://open-api.delcom.org/img/profile/1.png"
    );
  });

  it("menghapus garis miring di awal path relatif", () => {
    expect(resolvePhotoUrl("/img/profile/1.png")).toBe(
      "https://open-api.delcom.org/img/profile/1.png"
    );
  });
});