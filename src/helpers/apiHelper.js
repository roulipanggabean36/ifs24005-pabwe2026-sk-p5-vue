const ACCESS_TOKEN_KEY = "accessToken";

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function putAccessToken(token) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function removeAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

/**
 * Mengubah object params menjadi query string.
 * Nilai undefined, null, dan string kosong diabaikan.
 */
export function buildQueryString(params) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

/**
 * Wrapper fetch ke REST API Delcom.
 *
 * API Delcom membalas dengan { status: "success" | "fail", message, data }.
 * Wrapper ini menambahkan field boolean `success` agar mudah diperiksa.
 *
 * @param {string} path - mis. "/auth/login"
 * @param {Object} [options]
 * @param {string} [options.method="GET"]
 * @param {Object} [options.params] - query parameters
 * @param {Object|FormData} [options.body] - object dikirim sebagai JSON, FormData dikirim apa adanya
 * @param {boolean} [options.auth=true] - sertakan header Authorization jika token ada
 * @returns {Promise<{success: boolean, message: string, data: any}>}
 */
export async function apiFetch(path, options = {}) {
  const { method = "GET", params = {}, body, auth = true } = options;

  const headers = {};
  const token = getAccessToken();

  if (auth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let payload;
  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  try {
    const response = await fetch(
      `${DELCOM_BASEURL}${path}${buildQueryString(params)}`,
      { method, headers, body: payload }
    );
    const result = await response.json();
    return { ...result, success: result.status === "success" };
  } catch {
    return {
      success: false,
      message: "Tidak dapat terhubung ke server",
      data: null,
    };
  }
}