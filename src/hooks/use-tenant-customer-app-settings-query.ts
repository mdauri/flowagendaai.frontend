import { useQuery } from "@tanstack/react-query";
import { tenantService } from "@/services/tenant-service";

export const TENANT_CUSTOMER_APP_SETTINGS_QUERY_KEY = ["tenant-customer-app-settings"] as const;

export function useTenantCustomerAppSettingsQuery() {
  return useQuery({
    queryKey: TENANT_CUSTOMER_APP_SETTINGS_QUERY_KEY,
    queryFn: () => tenantService.getCustomerAppSettings(),
    retry: false,
    staleTime: 2 * 60 * 1000,
  });
}
