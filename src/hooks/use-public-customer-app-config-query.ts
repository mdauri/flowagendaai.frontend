import { useQuery } from "@tanstack/react-query";
import { customerAppService } from "@/services/customer-app-service";

export function usePublicCustomerAppConfigQuery(tenantSlug: string | undefined) {
  return useQuery({
    queryKey: ["public-customer-app-config", tenantSlug],
    queryFn: async () => {
      if (!tenantSlug) {
        throw new Error("Tenant slug ausente.");
      }

      return customerAppService.getPublicConfig(tenantSlug);
    },
    enabled: Boolean(tenantSlug),
    retry: false,
    staleTime: 2 * 60 * 1000,
  });
}
