/**
 * Mengubah nilai foto dari API menjadi URL yang bisa dipakai di <img>.
 * - kosong            -> ""
 * - sudah URL penuh   -> dikembalikan apa adanya
 * - path relatif      -> digabung dengan origin API, mis. "img/profile/1.png"
 */
export function resolvePhotoUrl(photo) {
  if (!photo) {
    return "";
  }

  if (/^https?:\/\//i.test(photo)) {
    return photo;
  }

  return `${new URL(DELCOM_BASEURL).origin}/${photo.replace(/^\/+/, "")}`;
}