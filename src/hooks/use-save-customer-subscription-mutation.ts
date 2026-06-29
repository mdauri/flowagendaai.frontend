import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CUSTOMER_SUBSCRIPTIONS_QUERY_KEY } from "@/hooks/use-customer-subscriptions-query";
import { subscriptionClubService } from "@/services/subscription-club-service";
import type {
  CreateCustomerSubscriptionInput,
  UpdateCustomerSubscriptionInput,
} from "@/types/subscription-club";

export function useSaveCustomerSubscriptionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      id?: string;
      payload: CreateCustomerSubscriptionInput | UpdateCustomerSubscriptionInput;
    }) =>
      input.id
        ? subscriptionClubService.updateCustomerSubscription(input.id, input.payload)
        : subscriptionClubService.createCustomerSubscription(
            input.payload as CreateCustomerSubscriptionInput
          ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: CUSTOMER_SUBSCRIPTIONS_QUERY_KEY,
      });
    },
  });
}

export function useCustomerSubscriptionStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { id: string; action: "activate" | "pause" | "cancel" }) => {
      if (input.action === "activate") {
        return subscriptionClubService.activateCustomerSubscription(input.id);
      }

      if (input.action === "pause") {
        return subscriptionClubService.pauseCustomerSubscription(input.id);
      }

      return subscriptionClubService.cancelCustomerSubscription(input.id);
    },
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
