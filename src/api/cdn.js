const CDN_URL = import.meta.env.VITE_CDN_URL;

/** Gambar dan dokumen memakai endpoint serta API key yang berbeda. */
function uploadTarget(file) {
  if (file.type.startsWith("image/")) {
    return {
      url: `${CDN_URL}/api/upload/${import.meta.env.VITE_IMAGE_SERVICE_NAME}/${import.meta.env.VITE_IMAGE_CATEGORY}`,
      apiKey: import.meta.env.VITE_IMAGE_API_KEY,
    };
  }
  return {
    url: `${CDN_URL}/api/upload-document/${import.meta.env.VITE_DOCUMENT_CATEGORY}`,
    apiKey: import.meta.env.VITE_DOCUMENT_API_KEY,
  };
}

/** Mengunggah file ke CDN dan mengembalikan URL-nya. */
export async function uploadAttachment(file) {
  const { url, apiKey } = uploadTarget(file);
  const formData = new FormData();
  formData.append("file", file);

  let response;
  try {
    // Content-Type sengaja tidak diisi agar browser menambahkan boundary multipart.
    response = await fetch(url, {
      method: "POST",
      headers: { Accept: "application/json", "X-API-KEY": apiKey },
      body: formData,
    });
  } catch {
    throw new Error("Tidak dapat terhubung ke server lampiran.");
  }

  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.status || !data?.url) {
    throw new Error(data?.message || "Gagal mengunggah lampiran.");
  }
  return data.url;
}
