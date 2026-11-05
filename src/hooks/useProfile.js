import { useQuery } from "@tanstack/react-query";
import { getProfile } from "../api/profile";

export const useProfile = () =>
  useQuery({ queryKey: ["profile"], queryFn: getProfile, staleTime: 5 * 60 * 1000 });
