import { useMutation } from "@tanstack/react-query";
import { subscriptionClubService } from "@/services/subscription-club-service";

export function useValidateSubscriptionUsageMutation() {
  return useMutation({
    mutationFn: subscriptionClubService.validateUsage,
  });
}
