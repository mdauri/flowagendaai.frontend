import { useMutation } from "@tanstack/react-query";
import { systemAdminService } from "@/services/system-admin-service";
import type { ProvisionTenantInput } from "@/types/system-admin";

export function useProvisionTenantMutation() {
  return useMutation({
    mutationFn: (input: ProvisionTenantInput) => systemAdminService.provisionTenant(input),
  });
}
