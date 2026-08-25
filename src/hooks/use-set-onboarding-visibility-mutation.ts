import { useMutation, useQueryClient } from "@tanstack/react-query";
import { onboardingService } from "@/services/onboarding-service";
import { ACTIVATION_QUERY_KEY } from "@/hooks/use-activation-query";
import type { OnboardingVisibility } from "@/types/onboarding";

export function useSetOnboardingVisibilityMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (visibility: OnboardingVisibility) => onboardingService.setVisibility(visibility),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ACTIVATION_QUERY_KEY });
    },
  });
}
