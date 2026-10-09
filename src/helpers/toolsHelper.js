import Swal from "sweetalert2";

const BASE_OPTIONS = {
  confirmButtonColor: "#4f46e5",
  cancelButtonColor: "#64748b",
};

export function showSuccessDialog(message) {
  return Swal.fire({
    ...BASE_OPTIONS,
    icon: "success",
    title: "Berhasil",
    text: message,
    timer: 2000,
    showConfirmButton: false,
  });
}

export function showErrorDialog(message) {
  return Swal.fire({
    ...BASE_OPTIONS,
    icon: "error",
    title: "Gagal",
    text: message,
  });
}

export function showWarningDialog(message) {
  return Swal.fire({
    ...BASE_OPTIONS,
    icon: "warning",
    title: "Perhatian",
    text: message,
  });
}

/**
 * Menampilkan dialog konfirmasi.
 * @returns {Promise<boolean>} true jika pengguna menekan "Ya"
 */
export async function showConfirmDialog(message) {
  const result = await Swal.fire({
    ...BASE_OPTIONS,
    icon: "question",
    title: "Konfirmasi",
    text: message,
    showCancelButton: true,
    confirmButtonText: "Ya",
    cancelButtonText: "Batal",
  });

  return result.isConfirmed;
}

/**
 * Format angka menjadi mata uang Rupiah, mis. 1500000 -> "Rp 1.500.000".
 * Nilai yang tidak valid dianggap 0.
 */
export function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

/**
 * Format tanggal/waktu ke locale Indonesia, mis. "8 Oktober 2026 14.30".
 * Mengembalikan string kosong jika nilai kosong atau tidak valid.
 */
export function formatDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}