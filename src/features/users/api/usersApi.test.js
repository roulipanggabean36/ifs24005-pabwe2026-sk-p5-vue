import { describe, it, expect, vi } from "vitest";
import { apiFetch } from "../../../helpers/apiHelper";
import {
  getUsers,
  getUserById,
  getProfile,
  putProfile,
  postProfilePhoto,
  putPassword,
} from "./usersApi";

vi.mock("../../../helpers/apiHelper", () => ({
  apiFetch: vi.fn(),
}));

describe("usersApi", () => {
  it("getUsers memanggil GET /users", async () => {
    apiFetch.mockResolvedValue({ success: true });

    const result = await getUsers();

    expect(apiFetch).toHaveBeenCalledWith("/users");
    expect(result).toEqual({ success: true });
  });

  it("getUserById memanggil GET /users/:id", async () => {
    apiFetch.mockResolvedValue({ success: true });

    await getUserById(7);

    expect(apiFetch).toHaveBeenCalledWith("/users/7");
  });

  it("getProfile memanggil GET /users/me", async () => {
    apiFetch.mockResolvedValue({ success: true });

    await getProfile();

    expect(apiFetch).toHaveBeenCalledWith("/users/me");
  });

  it("putProfile memanggil PUT /users/me dengan name dan email", async () => {
    apiFetch.mockResolvedValue({ success: true });

    await putProfile({ name: "Rouli", email: "a@b.co", extra: "diabaikan" });

    expect(apiFetch).toHaveBeenCalledWith("/users/me", {
      method: "PUT",
      body: { name: "Rouli", email: "a@b.co" },
    });
  });

  it("postProfilePhoto mengirim FormData berisi field photo", async () => {
    apiFetch.mockResolvedValue({ success: true });
    const file = new File(["x"], "foto.png", { type: "image/png" });

    await postProfilePhoto(file);

    const [path, options] = apiFetch.mock.calls[0];
    expect(path).toBe("/users/me/photo");
    expect(options.method).toBe("POST");
    expect(options.body).toBeInstanceOf(FormData);
    expect(options.body.get("photo")).toBe(file);
  });

  it("putPassword memetakan field ke snake_case", async () => {
    apiFetch.mockResolvedValue({ success: true });

    await putPassword({
      password: "lama123",
      newPassword: "baru123",
      newPasswordConfirmation: "baru123",
    });

    expect(apiFetch).toHaveBeenCalledWith("/users/password", {
      method: "PUT",
      body: {
        password: "lama123",
        new_password: "baru123",
        new_password_confirmation: "baru123",
      },
    });
  });
});