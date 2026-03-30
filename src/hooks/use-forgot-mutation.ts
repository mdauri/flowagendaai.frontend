import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth-service";
import type { ForgotRequest } from "@/types/auth";

export function useForgotMutation() {
  return useMutation({
    mutationFn: async (payload: ForgotRequest) => {
      const result = await authService.forgot(payload);
      return result;
    },
  });
}
