import { useQuery } from "@tanstack/react-query";
import { subscriptionClubService } from "@/services/subscription-club-service";

export const SUBSCRIPTION_PLANS_QUERY_KEY = ["subscription-club", "plans"] as const;

export function useSubscriptionPlansQuery(enabled = true) {
  return useQuery({
    queryKey: SUBSCRIPTION_PLANS_QUERY_KEY,
    queryFn: () => subscriptionClubService.listPlans(),
    enabled,
  });
}
