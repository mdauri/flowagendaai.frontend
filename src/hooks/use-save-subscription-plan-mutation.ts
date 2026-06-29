import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SUBSCRIPTION_PLANS_QUERY_KEY } from "@/hooks/use-subscription-plans-query";
import { subscriptionClubService } from "@/services/subscription-club-service";
import type {
  CreateSubscriptionPlanInput,
  UpdateSubscriptionPlanInput,
} from "@/types/subscription-club";

export function useSaveSubscriptionPlanMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      id?: string;
      payload: CreateSubscriptionPlanInput | UpdateSubscriptionPlanInput;
    }) =>
      input.id
        ? subscriptionClubService.updatePlan(input.id, input.payload)
        : subscriptionClubService.createPlan(input.payload as CreateSubscriptionPlanInput),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: SUBSCRIPTION_PLANS_QUERY_KEY,
      });
    },
  });
}

export function useDeactivateSubscriptionPlanMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planId: string) => subscriptionClubService.deactivatePlan(planId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: SUBSCRIPTION_PLANS_QUERY_KEY,
      });
    },
  });
}
