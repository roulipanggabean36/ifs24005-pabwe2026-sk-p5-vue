import { describe, it, expect, vi } from "vitest";
import { nextTick } from "vue";
import RegisterPage from "./RegisterPage.vue";
import { useAuthStore } from "../states/authStore";
import { renderWithProviders, flushPromises } from "../../../test-utils";

const byId = (wrapper, id) => wrapper.find(`[data-testid="${id}"]`);

const setup = async () => {
  const { wrapper, router, pinia } = await renderWithProviders(RegisterPage);
  const store = useAuthStore(pinia);
  const pushSpy = vi.spyOn(router, "push").mockResolvedValue();
  return { wrapper, store, pushSpy };
};

const fillForm = async (
  wrapper,
  { name = "", email = "", password = "", confirmPassword = "" }
) => {
  await byId(wrapper, "name-input").setValue(name);
  await byId(wrapper, "email-input").setValue(email);
  await byId(wrapper, "password-input").setValue(password);
  await byId(wrapper, "confirm-password-input").setValue(confirmPassword);
};

const submit = async (wrapper) => {
  await byId(wrapper, "register-form").trigger("submit");
  await flushPromises();
};

describe("RegisterPage", () => {
  it("menampilkan form dan tautan ke halaman login", async () => {
    const { wrapper } = await setup();

    expect(wrapper.text()).toContain("Buat akun baru");
    expect(byId(wrapper, "name-error").exists()).toBe(false);
    expect(byId(wrapper, "login-link").attributes("href")).toBe("/auth/login");
  });

  it("menampilkan error jika semua field kosong", async () => {
    const { wrapper, store } = await setup();
    const registerSpy = vi.spyOn(store, "register").mockResolvedValue(true);

    await submit(wrapper);

    expect(byId(wrapper, "name-error").text()).toBe("Nama wajib diisi");
    expect(byId(wrapper, "email-error").text()).toBe("Email wajib diisi");
    expect(byId(wrapper, "password-error").text()).toBe(
      "Kata sandi wajib diisi"
    );
    expect(byId(wrapper, "confirm-password-error").exists()).toBe(false);
    expect(registerSpy).not.toHaveBeenCalled();
  });

  it("menampilkan error jika format email tidak valid", async () => {
    const { wrapper, store } = await setup();
    const registerSpy = vi.spyOn(store, "register").mockResolvedValue(true);

    await fillForm(wrapper, {
      name: "Rouli",
      email: "bukan-email",
      password: "123456",
      confirmPassword: "123456",
    });
    await submit(wrapper);

    expect(byId(wrapper, "name-error").exists()).toBe(false);
    expect(byId(wrapper, "email-error").text()).toBe("Format email tidak valid");
    expect(registerSpy).not.toHaveBeenCalled();
  });

  it("menampilkan error jika kata sandi kurang dari 6 karakter", async () => {
    const { wrapper, store } = await setup();
    const registerSpy = vi.spyOn(store, "register").mockResolvedValue(true);

    await fillForm(wrapper, {
      name: "Rouli",
      email: "a@b.co",
      password: "123",
      confirmPassword: "123",
    });
    await submit(wrapper);

    expect(byId(wrapper, "email-error").exists()).toBe(false);
    expect(byId(wrapper, "password-error").text()).toBe(
      "Kata sandi minimal 6 karakter"
    );
    expect(registerSpy).not.toHaveBeenCalled();
  });

  it("menampilkan error jika konfirmasi kata sandi tidak sama", async () => {
    const { wrapper, store } = await setup();
    const registerSpy = vi.spyOn(store, "register").mockResolvedValue(true);

    await fillForm(wrapper, {
      name: "Rouli",
      email: "a@b.co",
      password: "123456",
      confirmPassword: "654321",
    });
    await submit(wrapper);

    expect(byId(wrapper, "password-error").exists()).toBe(false);
    expect(byId(wrapper, "confirm-password-error").text()).toBe(
      "Konfirmasi kata sandi tidak sama"
    );
    expect(registerSpy).not.toHaveBeenCalled();
  });

  it("memanggil register dan mengarahkan ke login jika berhasil", async () => {
    const { wrapper, store, pushSpy } = await setup();
    const registerSpy = vi.spyOn(store, "register").mockResolvedValue(true);

    await fillForm(wrapper, {
      name: "  Rouli  ",
      email: "a@b.co",
      password: "123456",
      confirmPassword: "123456",
    });
    await submit(wrapper);

    expect(registerSpy).toHaveBeenCalledWith({
      name: "Rouli",
      email: "a@b.co",
      password: "123456",
    });
    expect(pushSpy).toHaveBeenCalledWith("/auth/login");
  });

  it("tidak berpindah halaman jika registrasi gagal", async () => {
    const { wrapper, store, pushSpy } = await setup();
    vi.spyOn(store, "register").mockResolvedValue(false);

    await fillForm(wrapper, {
      name: "Rouli",
      email: "a@b.co",
      password: "123456",
      confirmPassword: "123456",
    });
    await submit(wrapper);

    expect(pushSpy).not.toHaveBeenCalled();
  });

  it("tombol mata menampilkan dan menyembunyikan kata sandi", async () => {
    const { wrapper } = await setup();
    const password = byId(wrapper, "password-input");
    const confirm = byId(wrapper, "confirm-password-input");

    expect(password.attributes("type")).toBe("password");
    expect(confirm.attributes("type")).toBe("password");

    await byId(wrapper, "toggle-password").trigger("click");
    expect(password.attributes("type")).toBe("text");
    expect(confirm.attributes("type")).toBe("text");

    await byId(wrapper, "toggle-password").trigger("click");
    expect(password.attributes("type")).toBe("password");
  });

  it("menonaktifkan tombol dan menampilkan loading saat proses registrasi", async () => {
    const { wrapper, store } = await setup();

    store.isAuthRegister = true;
    await nextTick();

    const button = byId(wrapper, "submit-button");
    expect(button.attributes("disabled")).toBeDefined();
    expect(button.text()).toContain("Memproses...");
  });
});