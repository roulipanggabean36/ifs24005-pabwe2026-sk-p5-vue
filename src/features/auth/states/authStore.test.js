import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { postLogin, postRegister } from "../api/authApi";
import { getAccessToken, putAccessToken } from "../../../helpers/apiHelper";
import {
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";
import { useAuthStore } from "./authStore";

vi.mock("../api/authApi", () => ({
  postLogin: vi.fn(),
  postRegister: vi.fn(),
}));

vi.mock("../../../helpers/toolsHelper", () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

describe("authStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe("state awal", () => {
    it("token null dan semua flag false jika belum login", () => {
      const store = useAuthStore();

      expect(store.token).toBeNull();
      expect(store.isAuthLogin).toBe(false);
      expect(store.isAuthRegister).toBe(false);
      expect(store.isAuthLogout).toBe(false);
      expect(store.isAuthenticated).toBe(false);
    });

    it("membaca token yang tersimpan di localStorage", () => {
      putAccessToken("saved-token");
      const store = useAuthStore();

      expect(store.token).toBe("saved-token");
      expect(store.isAuthenticated).toBe(true);
    });
  });

  describe("login", () => {
    it("berhasil: menyimpan token, menampilkan dialog sukses, mengembalikan true", async () => {
      postLogin.mockResolvedValue({
        success: true,
        message: "Login berhasil",
        data: { token: "t1" },
      });
      const store = useAuthStore();

      const result = await store.login({ email: "a@b.c", password: "123456" });

      expect(postLogin).toHaveBeenCalledWith({
        email: "a@b.c",
        password: "123456",
      });
      expect(result).toBe(true);
      expect(store.token).toBe("t1");
      expect(getAccessToken()).toBe("t1");
      expect(showSuccessDialog).toHaveBeenCalledWith("Login berhasil");
      expect(store.isAuthLogin).toBe(false);
    });

    it("gagal: menampilkan dialog error dan mengembalikan false", async () => {
      postLogin.mockResolvedValue({
        success: false,
        message: "Email atau kata sandi salah",
        data: null,
      });
      const store = useAuthStore();

      const result = await store.login({ email: "a@b.c", password: "salah" });

      expect(result).toBe(false);
      expect(store.token).toBeNull();
      expect(getAccessToken()).toBeNull();
      expect(showErrorDialog).toHaveBeenCalledWith(
        "Email atau kata sandi salah"
      );
      expect(store.isAuthLogin).toBe(false);
    });

    it("isAuthLogin bernilai true selama proses berjalan", async () => {
      let resolveLogin;
      postLogin.mockReturnValue(
        new Promise((resolve) => {
          resolveLogin = resolve;
        })
      );
      const store = useAuthStore();

      const promise = store.login({ email: "a@b.c", password: "123456" });
      expect(store.isAuthLogin).toBe(true);

      resolveLogin({ success: false, message: "x", data: null });
      await promise;
      expect(store.isAuthLogin).toBe(false);
    });
  });

  describe("register", () => {
    it("berhasil: menampilkan dialog sukses dan mengembalikan true", async () => {
      postRegister.mockResolvedValue({
        success: true,
        message: "Registrasi berhasil",
        data: null,
      });
      const store = useAuthStore();

      const result = await store.register({
        name: "Rouli",
        email: "a@b.c",
        password: "123456",
      });

      expect(postRegister).toHaveBeenCalledWith({
        name: "Rouli",
        email: "a@b.c",
        password: "123456",
      });
      expect(result).toBe(true);
      expect(showSuccessDialog).toHaveBeenCalledWith("Registrasi berhasil");
      expect(store.isAuthRegister).toBe(false);
    });

    it("gagal: menampilkan dialog error dan mengembalikan false", async () => {
      postRegister.mockResolvedValue({
        success: false,
        message: "Email sudah terdaftar",
        data: null,
      });
      const store = useAuthStore();

      const result = await store.register({
        name: "Rouli",
        email: "a@b.c",
        password: "123456",
      });

      expect(result).toBe(false);
      expect(showErrorDialog).toHaveBeenCalledWith("Email sudah terdaftar");
      expect(store.isAuthRegister).toBe(false);
    });

    it("isAuthRegister bernilai true selama proses berjalan", async () => {
      let resolveRegister;
      postRegister.mockReturnValue(
        new Promise((resolve) => {
          resolveRegister = resolve;
        })
      );
      const store = useAuthStore();

      const promise = store.register({
        name: "Rouli",
        email: "a@b.c",
        password: "123456",
      });
      expect(store.isAuthRegister).toBe(true);

      resolveRegister({ success: false, message: "x", data: null });
      await promise;
      expect(store.isAuthRegister).toBe(false);
    });
  });

  describe("logout", () => {
    it("menghapus token dari state dan localStorage", async () => {
      putAccessToken("saved-token");
      const store = useAuthStore();

      const result = await store.logout();

      expect(result).toBe(true);
      expect(store.token).toBeNull();
      expect(getAccessToken()).toBeNull();
      expect(store.isAuthLogout).toBe(false);
      expect(store.isAuthenticated).toBe(false);
    });
  });
});