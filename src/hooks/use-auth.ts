import { useCallback, useMemo, useSyncExternalStore } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  clearStoredToken,
  getStoredToken,
  subscribeToStoredToken,
} from "@/session/session-storage";
import { useCurrentUser } from "@/hooks/use-current-user";

export function useAuth() {
  const queryClient = useQueryClient();
  const currentUserQuery = useCurrentUser();
  const token = useSyncExternalStore(subscribeToStoredToken, getStoredToken, () => null);

  const logout = useCallback(() => {
    clearStoredToken();
    queryClient.clear();
  }, [queryClient]);

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
