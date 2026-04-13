import { httpClient } from "@/lib/http-client";
import type { ProvisionTenantInput, ProvisionTenantResponse } from "@/types/system-admin";

export const systemAdminService = {
  async provisionTenant(input: ProvisionTenantInput): Promise<ProvisionTenantResponse> {
    return httpClient<ProvisionTenantResponse>("/system-admin/tenants/provision", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};
