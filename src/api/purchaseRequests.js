import { request } from "./client";

export const getMySummary = () => request("/purchase-requests/my-summary");

export const createPurchaseRequest = (body) =>
  request("/purchase-requests", { method: "POST", body });

export const getPurchaseRequest = (id) => request(`/purchase-requests/${id}`);

export const deletePurchaseRequest = (id) =>
  request(`/purchase-requests/${id}`, { method: "DELETE" });

export const getPurchaseRequestPdf = (id) =>
  request(`/purchase-requests/${id}/pdf`, { responseType: "blob" });

export const getPurchaseRequests = (params) => request("/purchase-requests", { params });

export const getPurchaseRequestHistory = (params) =>
  request("/purchase-requests/history", { params });

/** Menyatukan lampiran menjadi satu file; urutan `files` menentukan urutan hasil. */
export function uploadPurchaseRequestAttachments(files) {
  const body = new FormData();
  files.forEach((file) => body.append("files", file));
  return request("/purchase-requests/attachments", { method: "POST", body });
}
