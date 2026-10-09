import { describe, it, expect, vi } from "vitest";
import { nextTick } from "vue";
import LoginPage from "./LoginPage.vue";
import { useAuthStore } from "../states/authStore";
import { renderWithProviders, flushPromises } from "../../../test-utils";

const byId = (wrapper, id) => wrapper.find(`[data-testid="${id}"]`);

const setup = async () => {
  const { wrapper, router, pinia } = await renderWithProviders(LoginPage);
  const store = useAuthStore(pinia);
  const pushSpy = vi.spyOn(router, "push").mockResolvedValue();
  return { wrapper, store, pushSpy };
};

const fillForm = async (wrapper, { email = "", password = "" }) => {
  await byId(wrapper, "email-input").setValue(email);
  await byId(wrapper, "password-input").setValue(password);
};

const submit = async (wrapper) => {
  await byId(wrapper, "login-form").trigger("submit");
  await flushPromises();
};

describe("LoginPage", () => {
  it("menampilkan form dan tautan ke halaman registrasi", async () => {
    const { wrapper } = await setup();

    expect(wrapper.text()).toContain("Masuk ke akun");
    expect(byId(wrapper, "email-error").exists()).toBe(false);
    expect(byId(wrapper, "password-error").exists()).toBe(false);
    expect(byId(wrapper, "register-link").attributes("href")).toBe(
      "/auth/register"
    );
  });

  it("menampilkan error jika email dan kata sandi kosong", async () => {
    const { wrapper, store } = await setup();
    const loginSpy = vi.spyOn(store, "login").mockResolvedValue(true);

    await submit(wrapper);

    expect(byId(wrapper, "email-error").text()).toBe("Email wajib diisi");
    expect(byId(wrapper, "password-error").text()).toBe(
      "Kata sandi wajib diisi"
    );
    expect(loginSpy).not.toHaveBeenCalled();
  });

  it("menampilkan error jika format email tidak valid", async () => {
    const { wrapper, store } = await setup();
    const loginSpy = vi.spyOn(store, "login").mockResolvedValue(true);

    await fillForm(wrapper, { email: "bukan-email", password: "123456" });
    await submit(wrapper);

    expect(byId(wrapper, "email-error").text()).toBe("Format email tidak valid");
    expect(byId(wrapper, "password-error").exists()).toBe(false);
    expect(loginSpy).not.toHaveBeenCalled();
  });

  it("menampilkan error jika hanya kata sandi yang kosong", async () => {
    const { wrapper, store } = await setup();
    const loginSpy = vi.spyOn(store, "login").mockResolvedValue(true);

    await fillForm(wrapper, { email: "a@b.co", password: "" });
    await submit(wrapper);

    expect(byId(wrapper, "email-error").exists()).toBe(false);
    expect(byId(wrapper, "password-error").text()).toBe(
      "Kata sandi wajib diisi"
    );
    expect(loginSpy).not.toHaveBeenCalled();
  });

  it("memanggil login dan mengarahkan ke beranda jika berhasil", async () => {
    const { wrapper, store, pushSpy } = await setup();
    const loginSpy = vi.spyOn(store, "login").mockResolvedValue(true);

    await fillForm(wrapper, { email: "a@b.co", password: "123456" });
    await submit(wrapper);

    expect(loginSpy).toHaveBeenCalledWith({
      email: "a@b.co",
      password: "123456",
    });
    expect(pushSpy).toHaveBeenCalledWith("/");
  });

  it("tidak berpindah halaman jika login gagal", async () => {
    const { wrapper, store, pushSpy } = await setup();
    vi.spyOn(store, "login").mockResolvedValue(false);

    await fillForm(wrapper, { email: "a@b.co", password: "salah" });
    await submit(wrapper);

    expect(pushSpy).not.toHaveBeenCalled();
  });

  it("tombol mata menampilkan dan menyembunyikan kata sandi", async () => {
    const { wrapper } = await setup();
    const input = byId(wrapper, "password-input");

    expect(input.attributes("type")).toBe("password");

    await byId(wrapper, "toggle-password").trigger("click");
    expect(input.attributes("type")).toBe("text");

    await byId(wrapper, "toggle-password").trigger("click");
    expect(input.attributes("type")).toBe("password");
  });

  it("menonaktifkan tombol dan menampilkan loading saat proses login", async () => {
    const { wrapper, store } = await setup();

    store.isAuthLogin = true;
    await nextTick();

    const button = byId(wrapper, "submit-button");
    expect(button.attributes("disabled")).toBeDefined();
    expect(button.text()).toContain("Memproses...");
  });
});