import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import {
  getProfile,
  getUserById,
  getUsers,
  postProfilePhoto,
  putPassword,
  putProfile,
} from "../api/usersApi";
import {
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";
import { useUsersStore } from "./usersStore";

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

const user = { id: 1, name: "Rouli", email: "rouli@del.ac.id", photo: null };
const failure = { success: false, message: "Gagal memproses", data: null };

describe("usersStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("memiliki state awal yang kosong", () => {
    const store = useUsersStore();

    expect(store.users).toEqual([]);
    expect(store.selectedUser).toBeNull();
    expect(store.profile).toBeNull();
    expect(store.isUsersLoading).toBe(false);
    expect(store.isUserLoading).toBe(false);
    expect(store.isProfileLoading).toBe(false);
    expect(store.isProfileUpdating).toBe(false);
    expect(store.isPhotoUpdating).toBe(false);
    expect(store.isPasswordUpdating).toBe(false);
  });

  describe("fetchUsers", () => {
    it("berhasil: mengisi users tanpa dialog", async () => {
      getUsers.mockResolvedValue({ success: true, data: { users: [user] } });
      const store = useUsersStore();

      const result = await store.fetchUsers();

      expect(result).toBe(true);
      expect(store.users).toEqual([user]);
      expect(showErrorDialog).not.toHaveBeenCalled();
      expect(showSuccessDialog).not.toHaveBeenCalled();
    });

    it("gagal: menampilkan dialog error dan users tetap kosong", async () => {
      getUsers.mockResolvedValue(failure);
      const store = useUsersStore();

      const result = await store.fetchUsers();

      expect(result).toBe(false);
      expect(store.users).toEqual([]);
      expect(showErrorDialog).toHaveBeenCalledWith("Gagal memproses");
    });
  });

  describe("fetchUserById", () => {
    it("berhasil: mengisi selectedUser", async () => {
      getUserById.mockResolvedValue({ success: true, data: { user } });
      const store = useUsersStore();

      const result = await store.fetchUserById(1);

      expect(getUserById).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
      expect(store.selectedUser).toEqual(user);
    });

    it("gagal: mengosongkan selectedUser lama dan menampilkan error", async () => {
      getUserById.mockResolvedValue(failure);
      const store = useUsersStore();
      store.selectedUser = { id: 99 };

      const result = await store.fetchUserById(1);

      expect(result).toBe(false);
      expect(store.selectedUser).toBeNull();
      expect(showErrorDialog).toHaveBeenCalledWith("Gagal memproses");
    });
  });

  describe("fetchProfile", () => {
    it("berhasil: mengisi profile", async () => {
      getProfile.mockResolvedValue({ success: true, data: { user } });
      const store = useUsersStore();

      const result = await store.fetchProfile();

      expect(result).toBe(true);
      expect(store.profile).toEqual(user);
    });

    it("gagal: profile tetap null dan menampilkan error", async () => {
      getProfile.mockResolvedValue(failure);
      const store = useUsersStore();

      const result = await store.fetchProfile();

      expect(result).toBe(false);
      expect(store.profile).toBeNull();
      expect(showErrorDialog).toHaveBeenCalledWith("Gagal memproses");
    });
  });

  describe("updateProfile", () => {
    it("berhasil: memperbarui profile dan menampilkan dialog sukses", async () => {
      const updated = { ...user, name: "Rouli Baru" };
      putProfile.mockResolvedValue({
        success: true,
        message: "Berhasil mengubah data",
        data: { user: updated },
      });
      const store = useUsersStore();

      const result = await store.updateProfile({
        name: "Rouli Baru",
        email: user.email,
      });

      expect(putProfile).toHaveBeenCalledWith({
        name: "Rouli Baru",
        email: user.email,
      });
      expect(result).toBe(true);
      expect(store.profile).toEqual(updated);
      expect(showSuccessDialog).toHaveBeenCalledWith("Berhasil mengubah data");
    });

    it("gagal: profile tidak berubah dan menampilkan error", async () => {
      putProfile.mockResolvedValue(failure);
      const store = useUsersStore();
      store.profile = user;

      const result = await store.updateProfile({ name: "X", email: "x@y.co" });

      expect(result).toBe(false);
      expect(store.profile).toEqual(user);
      expect(showErrorDialog).toHaveBeenCalledWith("Gagal memproses");
      expect(showSuccessDialog).not.toHaveBeenCalled();
    });
  });

  describe("updatePhoto", () => {
    const file = new File(["x"], "foto.png", { type: "image/png" });

    it("berhasil: mengunggah, memuat ulang profile, lalu dialog sukses", async () => {
      postProfilePhoto.mockResolvedValue({
        success: true,
        message: "Berhasil mengubah foto",
      });
      const refreshed = { ...user, photo: "img/profile/1.png" };
      getProfile.mockResolvedValue({ success: true, data: { user: refreshed } });
      const store = useUsersStore();

      const result = await store.updatePhoto(file);

      expect(postProfilePhoto).toHaveBeenCalledWith(file);
      expect(getProfile).toHaveBeenCalledTimes(1);
      expect(result).toBe(true);
      expect(store.profile).toEqual(refreshed);
      expect(showSuccessDialog).toHaveBeenCalledWith("Berhasil mengubah foto");
    });

    it("gagal: tidak memuat ulang profile dan menampilkan error", async () => {
      postProfilePhoto.mockResolvedValue(failure);
      const store = useUsersStore();

      const result = await store.updatePhoto(file);

      expect(result).toBe(false);
      expect(getProfile).not.toHaveBeenCalled();
      expect(showErrorDialog).toHaveBeenCalledWith("Gagal memproses");
    });
  });

  describe("updatePassword", () => {
    const payload = {
      password: "lama123",
      newPassword: "baru123",
      newPasswordConfirmation: "baru123",
    };

    it("berhasil: menampilkan dialog sukses", async () => {
      putPassword.mockResolvedValue({
        success: true,
        message: "Berhasil mengubah kata sandi",
      });
      const store = useUsersStore();

      const result = await store.updatePassword(payload);

      expect(putPassword).toHaveBeenCalledWith(payload);
      expect(result).toBe(true);
      expect(showSuccessDialog).toHaveBeenCalledWith(
        "Berhasil mengubah kata sandi"
      );
    });

    it("gagal: menampilkan dialog error", async () => {
      putPassword.mockResolvedValue(failure);
      const store = useUsersStore();

      const result = await store.updatePassword(payload);

      expect(result).toBe(false);
      expect(showErrorDialog).toHaveBeenCalledWith("Gagal memproses");
      expect(showSuccessDialog).not.toHaveBeenCalled();
    });
  });

  describe("flag loading", () => {
    it.each([
      ["fetchUsers", "isUsersLoading", getUsers, []],
      ["fetchUserById", "isUserLoading", getUserById, [1]],
      ["fetchProfile", "isProfileLoading", getProfile, []],
      [
        "updateProfile",
        "isProfileUpdating",
        putProfile,
        [{ name: "a", email: "b@c.co" }],
      ],
      [
        "updatePhoto",
        "isPhotoUpdating",
        postProfilePhoto,
        [new File(["x"], "p.png")],
      ],
      [
        "updatePassword",
        "isPasswordUpdating",
        putPassword,
        [{ password: "a", newPassword: "b", newPasswordConfirmation: "b" }],
      ],
    ])("%s mengaktifkan %s selama proses", async (action, flag, api, args) => {
      let resolveRequest;
      api.mockReturnValue(
        new Promise((resolve) => {
          resolveRequest = resolve;
        })
      );
      const store = useUsersStore();

      const promise = store[action](...args);
      expect(store[flag]).toBe(true);

      resolveRequest(failure);
      await promise;
      expect(store[flag]).toBe(false);
    });
  });
});