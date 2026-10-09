/**
 * API Delcom memakai format "YYYY-MM-DD HH:mm:ss".
 * Spasi diganti "T" agar terbaca konsisten oleh semua browser.
 */
export function normalizeDateTime(value) {
  return String(value).replace(" ", "T");
}

/**
 * Lelang dianggap ditutup jika batas waktunya sudah lewat (atau sama dengan sekarang).
 */
export function isAucationClosed(closedAt, now = Date.now()) {
  return new Date(normalizeDateTime(closedAt)).getTime() <= now;
}

/**
 * Nominal tawaran tertinggi dari daftar bid ({ id, bid, ... }). 0 jika kosong.
 */
export function getHighestBid(bids) {
  return bids.reduce((highest, item) => Math.max(highest, item.bid), 0);
}

/**
 * "2026-12-31T23:59" (input datetime-local) -> "2026-12-31 23:59:00" (format API).
 */
export function toApiDateTime(value) {
  return `${value.replace("T", " ")}:00`;
}

/**
 * "2026-12-31 23:59:00" (format API) -> "2026-12-31T23:59" (input datetime-local).
 */
export function toInputDateTime(value) {
  if (!value) {
    return "";
  }

  return normalizeDateTime(value).slice(0, 16);
}