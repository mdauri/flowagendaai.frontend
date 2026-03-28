import { useQuery } from "@tanstack/react-query";
import { authService } from "@/services/auth-service";
import { getStoredToken } from "@/session/session-storage";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: authService.me,
    enabled: Boolean(getStoredToken()),
    retry: false,
  });
}
