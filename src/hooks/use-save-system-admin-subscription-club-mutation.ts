import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSystemAdminSubscriptionClubQueryKey,
} from "@/hooks/use-system-admin-subscription-club-query";
import { systemAdminService } from "@/services/system-admin-service";

export function useSaveSystemAdminSubscriptionClubMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { tenantId: string; subscriptionClubAllowed: boolean }) =>
      systemAdminService.updateTenantSubscriptionClubSettings(input.tenantId, {
        subscriptionClubAllowed: input.subscriptionClubAllowed,
      }),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: getSystemAdminSubscriptionClubQueryKey(variables.tenantId),
      });
      await queryClient.invalidateQueries({
        queryKey: ["system-admin", "tenants"],
      });
    },
  });
}
