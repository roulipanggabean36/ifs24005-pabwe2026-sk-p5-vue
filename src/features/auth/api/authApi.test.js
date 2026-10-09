import { describe, it, expect, vi } from "vitest";
import { apiFetch } from "../../../helpers/apiHelper";
import { postLogin, postRegister } from "./authApi";

vi.mock("../../../helpers/apiHelper", () => ({
  apiFetch: vi.fn(),
}));

describe("authApi", () => {
  it("postLogin memanggil POST /auth/login tanpa token", async () => {
    apiFetch.mockResolvedValue({ success: true });

    const result = await postLogin({ email: "a@b.c", password: "123456" });

    expect(apiFetch).toHaveBeenCalledWith("/auth/login", {
      method: "POST",
      body: { email: "a@b.c", password: "123456" },
      auth: false,
    });
    expect(result).toEqual({ success: true });
  });

  it("postRegister memanggil POST /auth/register tanpa token", async () => {
    apiFetch.mockResolvedValue({ success: true });

    const result = await postRegister({
      name: "Rouli",
      email: "a@b.c",
      password: "123456",
    });

    expect(apiFetch).toHaveBeenCalledWith("/auth/register", {
      method: "POST",
      body: { name: "Rouli", email: "a@b.c", password: "123456" },
      auth: false,
    });
    expect(result).toEqual({ success: true });
  });
});