import { httpClient } from "@/lib/http-client";
import type {
  ListSystemAdminTenantsResponse,
  ProvisionTenantInput,
  ProvisionTenantResponse,
  SystemAdminTenantDepositFeeSettings,
  UpdateSystemAdminTenantDepositFeeInput,
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

  async getTenantDepositFeeSettings(tenantId: string): Promise<SystemAdminTenantDepositFeeSettings> {
    return httpClient<SystemAdminTenantDepositFeeSettings>(`/system-admin/tenants/${tenantId}/deposit-fee`);
  },

  async updateTenantDepositFeeSettings(
    tenantId: string,
    input: UpdateSystemAdminTenantDepositFeeInput
  ): Promise<SystemAdminTenantDepositFeeSettings> {
    return httpClient<SystemAdminTenantDepositFeeSettings>(
      `/system-admin/tenants/${tenantId}/deposit-fee`,
      {
        method: "PUT",
        body: JSON.stringify(input),
      }
    );
  },
};
