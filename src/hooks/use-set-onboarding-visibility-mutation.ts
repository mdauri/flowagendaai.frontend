import { useMutation, useQueryClient } from "@tanstack/react-query";
import { onboardingService } from "@/services/onboarding-service";
import { ACTIVATION_QUERY_KEY } from "@/hooks/use-activation-query";
import type { ActivationStatus, OnboardingVisibility } from "@/types/onboarding";

export function useSetOnboardingVisibilityMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (visibility: OnboardingVisibility) => onboardingService.setVisibility(visibility),
    onSuccess: async (result) => {
      queryClient.setQueryData<ActivationStatus>(ACTIVATION_QUERY_KEY, (current) => current ? { ...current, visibility: result.visibility } : current);
      await queryClient.invalidateQueries({ queryKey: ACTIVATION_QUERY_KEY });
    },
  });
}
