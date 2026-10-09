import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";
import router, { authGuard, isLoggedIn, routes } from "./router";
import { putAccessToken, removeAccessToken } from "./helpers/apiHelper";

// Editor dan viewer toast-ui tidak dibutuhkan untuk menguji rute
vi.mock("./features/aucations/components/DescriptionEditor.vue", () => ({
  default: { render: () => null },
}));
vi.mock("./features/aucations/components/DescriptionViewer.vue", () => ({
  default: { render: () => null },
}));

// Router baru per test agar tidak saling memengaruhi
const navigate = async (path) => {
  const testRouter = createRouter({ history: createMemoryHistory(), routes });
  testRouter.beforeEach(authGuard);
  await testRouter.push(path);
  return testRouter.currentRoute.value.path;
};

describe("router", () => {
  beforeEach(() => {
    removeAccessToken();
  });

  describe("isLoggedIn", () => {
    it("false jika token tidak ada", () => {
      expect(isLoggedIn()).toBe(false);
    });

    it("true jika token tersimpan", () => {
      putAccessToken("token-contoh");

      expect(isLoggedIn()).toBe(true);
    });
  });

  describe("authGuard", () => {
    it("rute terproteksi tanpa token diarahkan ke login", () => {
      expect(authGuard({ meta: { requiresAuth: true } })).toBe("/auth/login");
    });

    it("rute terproteksi dengan token diizinkan", () => {
      putAccessToken("token-contoh");

      expect(authGuard({ meta: { requiresAuth: true } })).toBe(true);
    });

    it("rute khusus tamu dengan token diarahkan ke beranda", () => {
      putAccessToken("token-contoh");

      expect(authGuard({ meta: { guestOnly: true } })).toBe("/");
    });

    it("rute khusus tamu tanpa token diizinkan", () => {
      expect(authGuard({ meta: { guestOnly: true } })).toBe(true);
    });

    it("rute tanpa penanda apa pun diizinkan", () => {
      expect(authGuard({ meta: {} })).toBe(true);
    });
  });

  describe("navigasi", () => {
    it("tanpa token: halaman terproteksi dialihkan ke login", async () => {
      expect(await navigate("/aucations/1")).toBe("/auth/login");
    });

    it("tanpa token: halaman login dan daftar bisa dibuka", async () => {
      expect(await navigate("/auth/login")).toBe("/auth/login");
      expect(await navigate("/auth/register")).toBe("/auth/register");
    });

    it("dengan token: semua halaman terproteksi bisa dibuka", async () => {
      putAccessToken("token-contoh");

      expect(await navigate("/")).toBe("/");
      expect(await navigate("/aucations/1")).toBe("/aucations/1");
      expect(await navigate("/users")).toBe("/users");
      expect(await navigate("/users/5")).toBe("/users/5");
      expect(await navigate("/profile")).toBe("/profile");
    });

    it("dengan token: halaman login dialihkan ke beranda", async () => {
      putAccessToken("token-contoh");

      expect(await navigate("/auth/login")).toBe("/");
    });

    it("rute tak dikenal dialihkan ke beranda, lalu ke login jika belum masuk", async () => {
      expect(await navigate("/tidak-ada")).toBe("/auth/login");

      putAccessToken("token-contoh");
      expect(await navigate("/tidak-ada")).toBe("/");
    });
  });

  it("router bawaan mengenali rute aplikasi", () => {
    expect(router.resolve("/profile").matched.length).toBeGreaterThan(0);
  });
});