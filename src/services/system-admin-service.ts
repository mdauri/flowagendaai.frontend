import { httpClient } from "@/lib/http-client";
import type {
  ListSystemAdminTenantsResponse,
  ProvisionTenantInput,
  ProvisionTenantResponse,
} from "@/types/system-admin";

export const systemAdminService = {
  async listTenants(): Promise<ListSystemAdminTenantsResponse> {
    return httpClient<ListSystemAdminTenantsResponse>("/system-admin/tenants");
  },

  async provisionTenant(input: ProvisionTenantInput): Promise<ProvisionTenantResponse> {
    return httpClient<ProvisionTenantResponse>("/system-admin/tenants/provision", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};
