import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth-service";
import type { ResetPasswordRequest } from "@/types/auth";

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: async (payload: ResetPasswordRequest) => {
      const result = await authService.resetPassword(payload);
      return result;
    },
  });
}
