import { defineStore } from "pinia";
import {
  getAucationById,
  getAucations,
  postAucation,
  postAucationCover,
  postBid,
  putAucation,
  removeAllAucations,
  removeAucation,
  removeBid,
} from "../api/aucationsApi";
import { execute } from "../../../helpers/storeHelper";
import {
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";

const COVER_NOT_UPLOADED_MESSAGE =
  "Lelang berhasil dibuat, tetapi cover gagal diunggah";

/**
 * @returns {Promise<string|null>} pesan error, atau null jika cover berhasil diunggah
 */
async function uploadCover(id, cover) {
  const response = await postAucationCover(id, cover);
  return response.success ? null : response.message;
}

/**
 * Respons "Add Aucation" tidak terdokumentasi, jadi id lelang yang baru dibuat
 * dicari dari daftar lelang milik sendiri: id terbesar = yang terbaru.
 */
async function uploadCoverForNewest(cover) {
  const list = await getAucations({ is_me: 1 });

  if (!list.success || list.data.aucations.length === 0) {
    return COVER_NOT_UPLOADED_MESSAGE;
  }

  const [newest] = [...list.data.aucations].sort((a, b) => b.id - a.id);
  return uploadCover(newest.id, cover);
}

/**
 * Simpan lelang (buat/ubah), lalu unggah cover jika ada.
 * Dialog sukses hanya muncul jika cover (bila ada) juga berhasil.
 */
async function saveWithCover(store, request, upload) {
  store.isAucationSaving = true;

  try {
    const response = await request();

    if (!response.success) {
      showErrorDialog(response.message);
      return false;
    }

    const coverError = await upload();

    if (coverError) {
      showErrorDialog(coverError);
    } else {
      showSuccessDialog(response.message);
    }

    return true;
  } finally {
    store.isAucationSaving = false;
  }
}

export const useAucationsStore = defineStore("aucations", {
  state: () => ({
    aucations: [],
    aucation: null,
    isAucationsLoading: false,
    isAucationLoading: false,
    isAucationSaving: false,
    isAucationDeleting: false,
    isBidSaving: false,
    isBidDeleting: false,
  }),

  actions: {
    fetchAucations(params = {}) {
      return execute(this, "isAucationsLoading", () => getAucations(params), {
        onSuccess: (response) => {
          this.aucations = response.data.aucations;
        },
      });
    },

    fetchAucation(id) {
      this.aucation = null;

      return execute(this, "isAucationLoading", () => getAucationById(id), {
        onSuccess: (response) => {
          this.aucation = response.data.aucation;
        },
      });
    },

    createAucation({ cover, ...payload }) {
      return saveWithCover(
        this,
        () => postAucation(payload),
        () => (cover ? uploadCoverForNewest(cover) : null)
      );
    },

    updateAucation(id, { cover, ...payload }) {
      return saveWithCover(
        this,
        () => putAucation(id, payload),
        () => (cover ? uploadCover(id, cover) : null)
      );
    },

    deleteAucation(id) {
      return execute(this, "isAucationDeleting", () => removeAucation(id), {
        showSuccess: true,
      });
    },

    deleteAllAucations() {
      return execute(this, "isAucationDeleting", () => removeAllAucations(), {
        showSuccess: true,
      });
    },

    placeBid(id, bid) {
      return execute(this, "isBidSaving", () => postBid(id, bid), {
        showSuccess: true,
      });
    },

    deleteBid(id) {
      return execute(this, "isBidDeleting", () => removeBid(id), {
        showSuccess: true,
      });
    },
  },
});