import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  clearStoredToken,
  getStoredToken,
  subscribeToStoredToken,
} from "@/session/session-storage";
import { useCurrentUser } from "@/hooks/use-current-user";
import { ApiError } from "@/types/api";

export function useAuth() {
  const queryClient = useQueryClient();
  const currentUserQuery = useCurrentUser();
  const token = useSyncExternalStore(subscribeToStoredToken, getStoredToken, () => null);

  const logout = useCallback(() => {
    clearStoredToken();
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    if (!(currentUserQuery.error instanceof ApiError) || currentUserQuery.error.status !== 401 || !token) {
      return;
    }

    clearStoredToken();
    queryClient.clear();
  }, [currentUserQuery.error, queryClient, token]);

  return useMemo(
    () => ({
      token,
      user: currentUserQuery.data?.user ?? null,
      tenant: currentUserQuery.data?.tenant ?? null,
      isAuthenticated: Boolean(token && currentUserQuery.data),
      isBootstrapping: currentUserQuery.isLoading,
      error: currentUserQuery.error,
      logout,
      refetchCurrentUser: currentUserQuery.refetch,
    }),
    [
      token,
      currentUserQuery.data,
      currentUserQuery.error,
      currentUserQuery.isLoading,
      currentUserQuery.refetch,
      logout,
    ]
  );
}
