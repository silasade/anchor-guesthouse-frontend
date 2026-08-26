import { useQuery } from "@tanstack/react-query";
import { requests } from "../api";
import { queryKeys } from "../queryKeys";
import { getToken } from "@/lib/auth";
import type { MeResponse } from "@/utils/types/Auth.type";

/**
 * Resolves the signed-in user from the JWT stored in cookies. Disabled outright
 * when no token is present so anonymous visitors never fire a doomed request.
 */
export const useGetSession = () => {
  const token = getToken();

  return useQuery({
    queryKey: queryKeys.session,
    queryFn: () => requests<MeResponse>("auth/me"),
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
