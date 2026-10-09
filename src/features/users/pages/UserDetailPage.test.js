import { describe, it, expect, vi } from "vitest";
import UserDetailPage from "./UserDetailPage.vue";
import { getUserById } from "../api/usersApi";
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

vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const user = {
  id: 2,
  name: "Abdullah Ubaid",
  email: "ifs18005@delcom.org",
  photo: null,
  created_at: "2024-10-05T03:18:14.000000Z",
};

const byId = (wrapper, id) => wrapper.find(`[data-testid="${id}"]`);

const render = () =>
  renderWithProviders(UserDetailPage, {
    routes: [{ path: "/users/:id", component: UserDetailPage }],
    route: "/users/2",
  });

describe("UserDetailPage", () => {
  it("memuat pengguna berdasarkan id pada rute dan menampilkan detailnya", async () => {
    getUserById.mockResolvedValue({ success: true, data: { user } });

    const { wrapper } = await render();

    expect(getUserById).toHaveBeenCalledWith("2");
    expect(byId(wrapper, "user-name").text()).toBe("Abdullah Ubaid");
    expect(byId(wrapper, "user-email").text()).toBe("ifs18005@delcom.org");
    expect(byId(wrapper, "user-joined").text()).toContain("Oktober 2024");
    expect(byId(wrapper, "avatar-fallback").exists()).toBe(true);
    expect(byId(wrapper, "back-link").attributes("href")).toBe("/users");
    expect(byId(wrapper, "user-not-found").exists()).toBe(false);
  });

  it("menampilkan indikator loading saat data dimuat", async () => {
    getUserById.mockReturnValue(new Promise(() => {}));

    const { wrapper } = await render();

    expect(byId(wrapper, "user-loading").exists()).toBe(true);
    expect(byId(wrapper, "user-detail").exists()).toBe(false);
  });

  it("menampilkan pesan tidak ditemukan dan dialog error jika gagal", async () => {
    getUserById.mockResolvedValue({
      success: false,
      message: "Pengguna tidak ada",
      data: null,
    });

    const { wrapper } = await render();

    expect(byId(wrapper, "user-not-found").exists()).toBe(true);
    expect(byId(wrapper, "user-detail").exists()).toBe(false);
    expect(showErrorDialog).toHaveBeenCalledWith("Pengguna tidak ada");
  });
});