import { httpClient } from "@/lib/http-client";
import type { OrderStoreSettings } from "@/types/order-module";
import type {
  ListSystemAdminTenantsResponse,
  ProvisionTenantInput,
  ProvisionTenantResponse,
  SystemAdminTenantDepositFeeSettings,
  SystemAdminTenantSubscriptionClubSettings,
  UpdateSystemAdminTenantDepositFeeInput,
  UpdateSystemAdminTenantSubscriptionClubInput,
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

  async getTenantSubscriptionClubSettings(
    tenantId: string
  ): Promise<SystemAdminTenantSubscriptionClubSettings> {
    return httpClient<SystemAdminTenantSubscriptionClubSettings>(
      `/system-admin/tenants/${tenantId}/subscription-club`
    );
  },

  async updateTenantSubscriptionClubSettings(
    tenantId: string,
    input: UpdateSystemAdminTenantSubscriptionClubInput
  ): Promise<SystemAdminTenantSubscriptionClubSettings> {
    return httpClient<SystemAdminTenantSubscriptionClubSettings>(
      `/system-admin/tenants/${tenantId}/subscription-club`,
      {
        method: "PUT",
        body: JSON.stringify(input),
      }
    );
  },

  async getTenantOrderSettings(tenantId: string): Promise<OrderStoreSettings> {
    return httpClient<OrderStoreSettings>(
      `/system-admin/tenants/${tenantId}/order-settings`
    );
  },

  async updateTenantOrderSettings(
    tenantId: string,
    input: Partial<OrderStoreSettings>
  ): Promise<OrderStoreSettings> {
    return httpClient<OrderStoreSettings>(
      `/system-admin/tenants/${tenantId}/order-settings`,
      {
        method: "PATCH",
        body: JSON.stringify(input),
      }
    );
  },
};
