import { showErrorDialog, showSuccessDialog } from "./toolsHelper";

/**
 * Pola umum aksi store: aktifkan flag loading, jalankan request,
 * tampilkan dialog error jika gagal, lalu matikan flag loading.
 *
 * @param {Object} store - instance store Pinia
 * @param {string} flag - nama state boolean untuk loading
 * @param {() => Promise<{success: boolean, message: string}>} request
 * @param {Object} [options]
 * @param {(response: Object) => any} [options.onSuccess] - dipanggil jika berhasil
 * @param {boolean} [options.showSuccess=false] - tampilkan dialog sukses
 * @returns {Promise<boolean>} true jika request berhasil
 */
export async function execute(
  store,
  flag,
  request,
  { onSuccess, showSuccess = false } = {}
) {
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