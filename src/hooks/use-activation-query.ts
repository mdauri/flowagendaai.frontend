import { useQuery } from "@tanstack/react-query";
import { onboardingService } from "@/services/onboarding-service";

export function useActivationQuery() {
  return useQuery({ queryKey: ["onboarding-activation"], queryFn: onboardingService.getActivation, retry: false });
}
