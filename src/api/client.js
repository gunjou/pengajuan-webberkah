const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const TOKEN_KEY = "access_token";

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  constructor({ status, message, code = null, fieldErrors = null }) {
    super(message);
    this.name = "ApiError";
    this.status = status; // status HTTP; 0 berarti gagal terhubung
    this.code = code; // mis. TOKEN_EXPIRED, VALIDATION_ERROR, NOT_FOUND
    this.fieldErrors = fieldErrors; // { namaField: pesan } atau null
  }
}

const FALLBACK_MESSAGES = {
  400: "Permintaan tidak valid.",
  401: "Sesi Anda telah berakhir. Silakan masuk kembali.",
  404: "Data tidak ditemukan.",
  422: "Data yang dikirim tidak valid.",
  500: "Terjadi kesalahan pada server.",
};

/** Menormalkan bentuk error A (JWT), B (aplikasi), C (query param), dan D (500). */
export function normalizeError(status, body) {
  const b = body && typeof body === "object" ? body : {};
  const code =
    b.error_code ?? (typeof b.code === "string" ? b.code : null);
  const hasFieldErrors =
    b.errors && typeof b.errors === "object" && Object.keys(b.errors).length > 0;

  return new ApiError({
    status,
    code,
    message:
      b.message ??
      FALLBACK_MESSAGES[status] ??
      "Terjadi kesalahan. Silakan coba lagi.",
    fieldErrors: hasFieldErrors ? b.errors : null,
  });
}

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return null; // mis. halaman HTML dari proxy atau server
  }
}

/**
 * Mengembalikan isi `data` dari respons sukses, atau Blob bila responseType "blob".
 * Melempar ApiError untuk semua kegagalan.
 */
export async function request(path, options = {}) {
  const {
    method = "GET",
    body,
    params,
    responseType = "json",
    skipAuthRedirect = false,
  } = options;

  const query = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, value);
    }
  });
  const queryString = query.toString();

  // FormData: Content-Type diisi browser agar boundary multipart ikut terkirim.
  const isFormData = body instanceof FormData;
  const headers = isFormData ? {} : { "Content-Type": "application/json" };
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(
      `${BASE_URL}${path}${queryString ? `?${queryString}` : ""}`,
      {
        method,
        headers,
        body: body === undefined || isFormData ? body : JSON.stringify(body),
      },
    );
  } catch {
    throw new ApiError({
      status: 0,
      code: "NETWORK_ERROR",
      message: "Tidak dapat terhubung ke server. Periksa koneksi Anda.",
    });
  }

  if (!response.ok) {
    const error = normalizeError(response.status, await readJson(response));
    if (response.status === 401 && !skipAuthRedirect) {
      tokenStore.clear();
      window.location.assign("/login");
    }
    throw error;
  }

  if (responseType === "blob") return response.blob();

  const payload = await readJson(response);
  return payload?.data ?? null;
}
