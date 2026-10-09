import { defineStore } from "pinia";
import { postLogin, postRegister } from "../api/authApi";
import {
  getAccessToken,
  putAccessToken,
  removeAccessToken,
} from "../../../helpers/apiHelper";
import {
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: getAccessToken(),
    isAuthLogin: false,
    isAuthRegister: false,
    isAuthLogout: false,
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.token),
  },

  actions: {
    /**
     * @returns {Promise<boolean>} true jika login berhasil
     */
    async login(payload) {
      this.isAuthLogin = true;

      try {
        const response = await postLogin(payload);

        if (!response.success) {
          showErrorDialog(response.message);
          return false;
        }

        putAccessToken(response.data.token);
        this.token = response.data.token;
        showSuccessDialog(response.message);
        return true;
      } finally {
        this.isAuthLogin = false;
      }
    },

    /**
     * @returns {Promise<boolean>} true jika registrasi berhasil
     */
    async register(payload) {
      this.isAuthRegister = true;

      try {
        const response = await postRegister(payload);

        if (!response.success) {
          showErrorDialog(response.message);
          return false;
        }

        showSuccessDialog(response.message);
        return true;
      } finally {
        this.isAuthRegister = false;
      }
    },

    async logout() {
      this.isAuthLogout = true;

      removeAccessToken();
      this.token = null;

      this.isAuthLogout = false;
      return true;
    },
  },
});