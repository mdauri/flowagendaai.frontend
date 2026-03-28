import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth-service";
import { setStoredToken } from "@/session/session-storage";
import type { LoginRequest } from "@/types/auth";

export function useLoginMutation() {
  return useMutation({
    mutationFn: async (payload: LoginRequest) => {
      const result = await authService.login(payload);
      setStoredToken(result.accessToken);
      return result;
    },
  });
}
