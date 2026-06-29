import { useQuery } from "@tanstack/react-query";
import { subscriptionClubService } from "@/services/subscription-club-service";

export const CUSTOMER_SUBSCRIPTIONS_QUERY_KEY = [
  "subscription-club",
  "subscriptions",
] as const;

export function useCustomerSubscriptionsQuery(enabled = true) {
  return useQuery({
    queryKey: CUSTOMER_SUBSCRIPTIONS_QUERY_KEY,
    queryFn: () => subscriptionClubService.listCustomerSubscriptions(),
    enabled,
  });
}
