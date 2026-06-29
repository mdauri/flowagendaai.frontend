import { useQuery } from "@tanstack/react-query";
import { subscriptionClubService } from "@/services/subscription-club-service";

export function getCustomerSubscriptionDetailQueryKey(subscriptionId: string) {
  return ["subscription-club", "subscriptions", subscriptionId] as const;
}

export function useCustomerSubscriptionDetailQuery(subscriptionId: string | null) {
  return useQuery({
    queryKey: getCustomerSubscriptionDetailQueryKey(subscriptionId ?? ""),
    queryFn: () => subscriptionClubService.getCustomerSubscription(subscriptionId ?? ""),
    enabled: Boolean(subscriptionId),
  });
}
