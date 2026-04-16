import { useQuery } from "@tanstack/react-query";
import { systemAdminService } from "@/services/system-admin-service";

export const SYSTEM_ADMIN_TENANTS_QUERY_KEY = ["system-admin", "tenants"] as const;

export function useSystemAdminTenantsQuery() {
  return useQuery({
    queryKey: SYSTEM_ADMIN_TENANTS_QUERY_KEY,
    queryFn: () => systemAdminService.listTenants(),
  });
}
