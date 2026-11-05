import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPurchaseRequest,
  deletePurchaseRequest,
  getMySummary,
  getPurchaseRequest,
  getPurchaseRequestHistory,
  getPurchaseRequests,
} from "../api/purchaseRequests";

export const useMySummary = () =>
  useQuery({ queryKey: ["purchase-requests", "my-summary"], queryFn: getMySummary });

export const useCreatePurchaseRequest = (options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPurchaseRequest,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["purchase-requests"] });
      options?.onSuccess?.(...args);
    },
  });
};

export const usePurchaseRequest = (id) =>
  useQuery({
    queryKey: ["purchase-requests", "detail", id],
    queryFn: () => getPurchaseRequest(id),
    enabled: /^\d+$/.test(id),
  });

export const useDeletePurchaseRequest = (id, options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deletePurchaseRequest(id),
    ...options,
    onSuccess: (...args) => {
      // Detail dibuang, bukan dimuat ulang: datanya sudah tidak ada.
      queryClient.removeQueries({ queryKey: ["purchase-requests", "detail", id] });
      queryClient.invalidateQueries({ queryKey: ["purchase-requests"] });
      options?.onSuccess?.(...args);
    },
  });
};

export const usePurchaseRequests = (params, options) =>
  useQuery({
    queryKey: ["purchase-requests", "list", params],
    queryFn: () => getPurchaseRequests(params),
    placeholderData: keepPreviousData,
    ...options,
  });

export const usePurchaseRequestHistory = (params, options) =>
  useQuery({
    queryKey: ["purchase-requests", "history", params],
    queryFn: () => getPurchaseRequestHistory(params),
    placeholderData: keepPreviousData,
    ...options,
  });
