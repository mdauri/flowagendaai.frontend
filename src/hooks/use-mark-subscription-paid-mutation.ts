import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CUSTOMER_SUBSCRIPTIONS_QUERY_KEY } from "@/hooks/use-customer-subscriptions-query";
import { subscriptionClubService } from "@/services/subscription-club-service";
import type { MarkSubscriptionPaidInput } from "@/types/subscription-club";

export function useMarkSubscriptionPaidMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { id: string; payload: MarkSubscriptionPaidInput }) =>
      subscriptionClubService.markPaid(input.id, input.payload),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: CUSTOMER_SUBSCRIPTIONS_QUERY_KEY,
      });
      await queryClient.invalidateQueries({
        queryKey: ["subscription-club", "subscriptions", variables.id],
      });
    },
  });
}
