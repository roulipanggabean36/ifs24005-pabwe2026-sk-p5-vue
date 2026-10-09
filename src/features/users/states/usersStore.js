import { defineStore } from "pinia";
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

/**
 * Pola umum aksi store: aktifkan flag loading, jalankan request,
 * tampilkan dialog error jika gagal, lalu matikan flag loading.
 *
 * @returns {Promise<boolean>} true jika request berhasil
 */
async function execute(store, flag, request, { onSuccess, showSuccess = false }) {
  store[flag] = true;

  try {
    const response = await request();

    if (!response.success) {
      showErrorDialog(response.message);
      return false;
    }

    if (onSuccess) {
      await onSuccess(response);
    }

    if (showSuccess) {
      showSuccessDialog(response.message);
    }

    return true;
  } finally {
    store[flag] = false;
  }
}

export const useUsersStore = defineStore("users", {
  state: () => ({
    users: [],
    selectedUser: null,
    profile: null,
    isUsersLoading: false,
    isUserLoading: false,
    isProfileLoading: false,
    isProfileUpdating: false,
    isPhotoUpdating: false,
    isPasswordUpdating: false,
  }),

  actions: {
    fetchUsers() {
      return execute(this, "isUsersLoading", getUsers, {
        onSuccess: (response) => {
          this.users = response.data.users;
        },
      });
    },

    fetchUserById(id) {
      this.selectedUser = null;

      return execute(this, "isUserLoading", () => getUserById(id), {
        onSuccess: (response) => {
          this.selectedUser = response.data.user;
        },
      });
    },

    fetchProfile() {
      return execute(this, "isProfileLoading", getProfile, {
        onSuccess: (response) => {
          this.profile = response.data.user;
        },
      });
    },

    updateProfile(payload) {
      return execute(this, "isProfileUpdating", () => putProfile(payload), {
        onSuccess: (response) => {
          this.profile = response.data.user;
        },
        showSuccess: true,
      });
    },

    updatePhoto(file) {
      return execute(this, "isPhotoUpdating", () => postProfilePhoto(file), {
        onSuccess: () => this.fetchProfile(),
        showSuccess: true,
      });
    },

    updatePassword(payload) {
      return execute(this, "isPasswordUpdating", () => putPassword(payload), {
        showSuccess: true,
      });
    },
  },
});