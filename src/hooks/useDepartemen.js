import { useQuery } from "@tanstack/react-query";
import { getDepartemen } from "../api/master";

export const useDepartemen = () =>
  useQuery({
    queryKey: ["departemen"],
    queryFn: getDepartemen,
    // Backend menolak departemen yang tidak aktif.
    select: (rows) => rows.filter((row) => row.status === 1),
    staleTime: 5 * 60 * 1000,
  });
