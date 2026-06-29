import { useQuery } from "@tanstack/react-query";
import { systemAdminService } from "@/services/system-admin-service";

export function getSystemAdminSubscriptionClubQueryKey(tenantId: string) {
  return ["system-admin", "tenant-subscription-club", tenantId] as const;
}

export function useSystemAdminSubscriptionClubQuery(tenantId: string) {
  return useQuery({
    queryKey: getSystemAdminSubscriptionClubQueryKey(tenantId),
    queryFn: () => systemAdminService.getTenantSubscriptionClubSettings(tenantId),
    enabled: Boolean(tenantId),
  });
}
