import { useQuery } from "@tanstack/react-query";
import { onboardingService } from "@/services/onboarding-service";

export const ACTIVATION_QUERY_KEY = ["onboarding-activation"] as const;

export function useActivationQuery() {
  return useQuery({ queryKey: ACTIVATION_QUERY_KEY, queryFn: onboardingService.getActivation, retry: false });
}
