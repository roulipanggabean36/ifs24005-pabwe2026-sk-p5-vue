import { describe, it, expect, vi } from "vitest";
import ProfilePage from "./ProfilePage.vue";
import { getProfile } from "../api/usersApi";
import { useUsersStore } from "../states/usersStore";
import { showErrorDialog } from "../../../helpers/toolsHelper";
import { renderWithProviders, flushPromises } from "../../../test-utils";

vi.mock("../api/usersApi", () => ({
  getUsers: vi.fn(),
  getUserById: vi.fn(),
  getProfile: vi.fn(),
  putProfile: vi.fn(),
  postProfilePhoto: vi.fn(),
  putPassword: vi.fn(),
}));

vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const profile = {
  id: 1,
  name: "Rouli",
  email: "rouli@del.ac.id",
  photo: "img/profile/1.png",
  created_at: "2024-10-05T03:26:57.000000Z",
};

const byId = (wrapper, id) => wrapper.find(`[data-testid="${id}"]`);

const setup = async (response = { success: true, data: { user: profile } }) => {
  getProfile.mockResolvedValue(response);
  const { wrapper, pinia } = await renderWithProviders(ProfilePage);
  const store = useUsersStore(pinia);
  return { wrapper, store };
};

const submit = async (wrapper, formId) => {
  await byId(wrapper, formId).trigger("submit");
  await flushPromises();
};

const fillPasswordForm = async (wrapper, { current, next, confirm }) => {
  await byId(wrapper, "current-password-input").setValue(current);
  await byId(wrapper, "new-password-input").setValue(next);
  await byId(wrapper, "confirm-password-input").setValue(confirm);
};

describe("ProfilePage - tampilan", () => {
  it("memuat profil, menampilkannya, dan mengisi form", async () => {
    const { wrapper } = await setup();

    expect(getProfile).toHaveBeenCalledTimes(1);
    expect(byId(wrapper, "profile-name").text()).toBe("Rouli");
    expect(byId(wrapper, "profile-email").text()).toBe("rouli@del.ac.id");
    expect(byId(wrapper, "profile-joined").text()).toContain("Oktober 2024");
    expect(byId(wrapper, "avatar-image").attributes("src")).toBe(
      "https://open-api.delcom.org/img/profile/1.png"
    );
    expect(byId(wrapper, "name-input").element.value).toBe("Rouli");
    expect(byId(wrapper, "email-input").element.value).toBe("rouli@del.ac.id");
  });

  it("menampilkan indikator loading saat profil dimuat", async () => {
    getProfile.mockReturnValue(new Promise(() => {}));
    const { wrapper } = await renderWithProviders(ProfilePage);

    expect(byId(wrapper, "profile-loading").exists()).toBe(true);
    expect(byId(wrapper, "profile-form").exists()).toBe(false);
  });

  it("menampilkan pesan error jika profil gagal dimuat", async () => {
    const { wrapper } = await setup({
      success: false,
      message: "Sesi berakhir",
      data: null,
    });

    expect(byId(wrapper, "profile-error").exists()).toBe(true);
    expect(byId(wrapper, "profile-form").exists()).toBe(false);
    expect(showErrorDialog).toHaveBeenCalledWith("Sesi berakhir");
  });
});

describe("ProfilePage - ubah profil", () => {
  it("menampilkan error jika nama dan email kosong", async () => {
    const { wrapper, store } = await setup();
    const spy = vi.spyOn(store, "updateProfile").mockResolvedValue(true);

    await byId(wrapper, "name-input").setValue("   ");
    await byId(wrapper, "email-input").setValue("");
    await submit(wrapper, "profile-form");

    expect(byId(wrapper, "name-error").text()).toBe("Nama wajib diisi");
    expect(byId(wrapper, "email-error").text()).toBe("Email wajib diisi");
    expect(spy).not.toHaveBeenCalled();
  });

  it("menampilkan error jika format email tidak valid", async () => {
    const { wrapper, store } = await setup();
    const spy = vi.spyOn(store, "updateProfile").mockResolvedValue(true);

    await byId(wrapper, "email-input").setValue("bukan-email");
    await submit(wrapper, "profile-form");

    expect(byId(wrapper, "name-error").exists()).toBe(false);
    expect(byId(wrapper, "email-error").text()).toBe("Format email tidak valid");
    expect(spy).not.toHaveBeenCalled();
  });

  it("memanggil updateProfile dengan data yang sudah dirapikan", async () => {
    const { wrapper, store } = await setup();
    const spy = vi.spyOn(store, "updateProfile").mockResolvedValue(true);

    await byId(wrapper, "name-input").setValue("  Rouli Baru  ");
    await byId(wrapper, "email-input").setValue("baru@del.ac.id");
    await submit(wrapper, "profile-form");

    expect(spy).toHaveBeenCalledWith({
      name: "Rouli Baru",
      email: "baru@del.ac.id",
    });
    expect(byId(wrapper, "name-error").exists()).toBe(false);
    expect(byId(wrapper, "email-error").exists()).toBe(false);
  });

  it("menonaktifkan tombol dan menampilkan loading saat menyimpan", async () => {
    const { wrapper, store } = await setup();

    store.isProfileUpdating = true;
    await flushPromises();

    const button = byId(wrapper, "profile-submit");
    expect(button.attributes("disabled")).toBeDefined();
    expect(button.text()).toContain("Menyimpan...");
  });
});

describe("ProfilePage - ubah foto", () => {
  const chooseFiles = async (wrapper, files) => {
    const input = byId(wrapper, "photo-input");
    Object.defineProperty(input.element, "files", {
      value: files,
      configurable: true,
    });
    await input.trigger("change");
    await flushPromises();
  };

  it("mengunggah foto yang dipilih", async () => {
    const { wrapper, store } = await setup();
    const spy = vi.spyOn(store, "updatePhoto").mockResolvedValue(true);
    const file = new File(["x"], "foto.png", { type: "image/png" });

    await chooseFiles(wrapper, [file]);

    expect(spy).toHaveBeenCalledWith(file);
  });

  it("tidak melakukan apa-apa jika tidak ada file dipilih", async () => {
    const { wrapper, store } = await setup();
    const spy = vi.spyOn(store, "updatePhoto").mockResolvedValue(true);

    await chooseFiles(wrapper, []);

    expect(spy).not.toHaveBeenCalled();
  });

  it("menampilkan status mengunggah dan menonaktifkan input", async () => {
    const { wrapper, store } = await setup();

    expect(byId(wrapper, "photo-label").text()).toContain("Ubah foto");

    store.isPhotoUpdating = true;
    await flushPromises();

    expect(byId(wrapper, "photo-label").text()).toContain("Mengunggah...");
    expect(byId(wrapper, "photo-input").attributes("disabled")).toBeDefined();
  });
});

describe("ProfilePage - ubah kata sandi", () => {
  it("menampilkan error jika semua field kosong", async () => {
    const { wrapper, store } = await setup();
    const spy = vi.spyOn(store, "updatePassword").mockResolvedValue(true);

    await submit(wrapper, "password-form");

    expect(byId(wrapper, "current-password-error").text()).toBe(
      "Kata sandi saat ini wajib diisi"
    );
    expect(byId(wrapper, "new-password-error").text()).toBe(
      "Kata sandi baru wajib diisi"
    );
    expect(byId(wrapper, "confirm-password-error").exists()).toBe(false);
    expect(spy).not.toHaveBeenCalled();
  });

  it("menampilkan error jika kata sandi baru kurang dari 6 karakter", async () => {
    const { wrapper, store } = await setup();
    const spy = vi.spyOn(store, "updatePassword").mockResolvedValue(true);

    await fillPasswordForm(wrapper, {
      current: "lama123",
      next: "123",
      confirm: "123",
    });
    await submit(wrapper, "password-form");

    expect(byId(wrapper, "current-password-error").exists()).toBe(false);
    expect(byId(wrapper, "new-password-error").text()).toBe(
      "Kata sandi baru minimal 6 karakter"
    );
    expect(spy).not.toHaveBeenCalled();
  });

  it("menampilkan error jika konfirmasi tidak sama", async () => {
    const { wrapper, store } = await setup();
    const spy = vi.spyOn(store, "updatePassword").mockResolvedValue(true);

    await fillPasswordForm(wrapper, {
      current: "lama123",
      next: "baru123",
      confirm: "beda123",
    });
    await submit(wrapper, "password-form");

    expect(byId(wrapper, "new-password-error").exists()).toBe(false);
    expect(byId(wrapper, "confirm-password-error").text()).toBe(
      "Konfirmasi kata sandi tidak sama"
    );
    expect(spy).not.toHaveBeenCalled();
  });

  it("berhasil: memanggil updatePassword lalu mengosongkan form", async () => {
    const { wrapper, store } = await setup();
    const spy = vi.spyOn(store, "updatePassword").mockResolvedValue(true);

    await fillPasswordForm(wrapper, {
      current: "lama123",
      next: "baru123",
      confirm: "baru123",
    });
    await submit(wrapper, "password-form");

    expect(spy).toHaveBeenCalledWith({
      password: "lama123",
      newPassword: "baru123",
      newPasswordConfirmation: "baru123",
    });
    expect(byId(wrapper, "current-password-input").element.value).toBe("");
    expect(byId(wrapper, "new-password-input").element.value).toBe("");
    expect(byId(wrapper, "confirm-password-input").element.value).toBe("");
  });

  it("gagal: form tidak dikosongkan", async () => {
    const { wrapper, store } = await setup();
    vi.spyOn(store, "updatePassword").mockResolvedValue(false);

    await fillPasswordForm(wrapper, {
      current: "salah123",
      next: "baru123",
      confirm: "baru123",
    });
    await submit(wrapper, "password-form");

    expect(byId(wrapper, "current-password-input").element.value).toBe(
      "salah123"
    );
    expect(byId(wrapper, "new-password-input").element.value).toBe("baru123");
  });

  it("menonaktifkan tombol dan menampilkan loading saat memproses", async () => {
    const { wrapper, store } = await setup();

    store.isPasswordUpdating = true;
    await flushPromises();

    const button = byId(wrapper, "password-submit");
    expect(button.attributes("disabled")).toBeDefined();
    expect(button.text()).toContain("Memproses...");
  });
});