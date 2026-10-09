import { describe, it, expect, vi } from "vitest";
import UsersPage from "./UsersPage.vue";
import { getUsers } from "../api/usersApi";
import { showErrorDialog } from "../../../helpers/toolsHelper";
import { renderWithProviders } from "../../../test-utils";

vi.mock("../api/usersApi", () => ({
  getUsers: vi.fn(),
  getUserById: vi.fn(),
  getProfile: vi.fn(),
  putProfile: vi.fn(),
  postProfilePhoto: vi.fn(),
  putPassword: vi.fn(),
}));

vi.mock("../../../helpers/toolsHelper", () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const users = [
  {
    id: 1,
    name: "Delcom Testing",
    email: "testing@delcom.org",
    photo: "https://cdn.example.com/u1.png",
  },
  {
    id: 2,
    name: "Abdullah Ubaid",
    email: "ifs18005@delcom.org",
    photo: null,
  },
];

const byId = (wrapper, id) => wrapper.find(`[data-testid="${id}"]`);

const setup = async (response = { success: true, data: { users } }) => {
  getUsers.mockResolvedValue(response);
  return renderWithProviders(UsersPage);
};

describe("UsersPage", () => {
  it("memuat dan menampilkan daftar pengguna beserta tautan detail", async () => {
    const { wrapper } = await setup();

    expect(getUsers).toHaveBeenCalledTimes(1);
    expect(wrapper.text()).toContain("Direktori Pengguna");
    expect(wrapper.text()).toContain("Delcom Testing");
    expect(wrapper.text()).toContain("ifs18005@delcom.org");
    expect(byId(wrapper, "user-card-1").attributes("href")).toBe("/users/1");
    expect(byId(wrapper, "user-card-2").attributes("href")).toBe("/users/2");
    expect(byId(wrapper, "users-empty").exists()).toBe(false);
  });

  it("menampilkan indikator loading saat data dimuat", async () => {
    getUsers.mockReturnValue(new Promise(() => {}));
    const { wrapper } = await renderWithProviders(UsersPage);

    expect(byId(wrapper, "users-loading").exists()).toBe(true);
    expect(byId(wrapper, "users-empty").exists()).toBe(false);
  });

  it("menyaring pengguna berdasarkan nama tanpa membedakan huruf besar/kecil", async () => {
    const { wrapper } = await setup();

    await byId(wrapper, "search-input").setValue("  ABDULLAH ");

    expect(byId(wrapper, "user-card-1").exists()).toBe(false);
    expect(byId(wrapper, "user-card-2").exists()).toBe(true);
  });

  it("menyaring pengguna berdasarkan email", async () => {
    const { wrapper } = await setup();

    await byId(wrapper, "search-input").setValue("testing@");

    expect(byId(wrapper, "user-card-1").exists()).toBe(true);
    expect(byId(wrapper, "user-card-2").exists()).toBe(false);
  });

  it("menampilkan pesan kosong jika tidak ada yang cocok", async () => {
    const { wrapper } = await setup();

    await byId(wrapper, "search-input").setValue("tidak-ada");

    expect(byId(wrapper, "users-empty").text()).toBe("Pengguna tidak ditemukan.");
  });

  it("menampilkan pesan kosong dan dialog error jika gagal memuat", async () => {
    const { wrapper } = await setup({
      success: false,
      message: "Gagal memuat",
      data: null,
    });

    expect(byId(wrapper, "users-empty").exists()).toBe(true);
    expect(showErrorDialog).toHaveBeenCalledWith("Gagal memuat");
  });
});