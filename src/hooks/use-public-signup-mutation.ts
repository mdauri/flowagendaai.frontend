import { useMutation } from "@tanstack/react-query";
import { setStoredToken } from "@/session/session-storage";
import { signupService } from "@/services/signup-service";
import type { PublicSignupRequest } from "@/types/signup";

export function usePublicSignupMutation() {
  return useMutation({
    mutationFn: async (payload: PublicSignupRequest) => {
      const result = await signupService.signup(payload);
      setStoredToken(result.accessToken);
      return result;
    },
  });
}
