import { httpClient } from "@/lib/http-client";
import type {
  ConnectSystemAdminTenantMetaWhatsappInput,
  ListSystemAdminTenantsResponse,
  ProvisionTenantInput,
  ProvisionTenantResponse,
  SendSystemAdminTenantMetaWhatsappTestMessageInput,
  SystemAdminTenantMetaWhatsappAccessResponse,
  SystemAdminTenantMetaWhatsappStatusResponse,
  SystemAdminTenantDepositFeeSettings,
  SystemAdminTenantSubscriptionClubSettings,
  UpdateSystemAdminTenantMetaWhatsappAccessInput,
  UpdateSystemAdminTenantDepositFeeInput,
  UpdateSystemAdminTenantSubscriptionClubInput,
} from "@/types/system-admin";

export const systemAdminService = {
  async listTenants(): Promise<ListSystemAdminTenantsResponse> {
    return httpClient<ListSystemAdminTenantsResponse>("/system-admin/tenants");
  },

  async provisionTenant(
    input: ProvisionTenantInput,
  ): Promise<ProvisionTenantResponse> {
    return httpClient<ProvisionTenantResponse>(
      "/system-admin/tenants/provision",
      {
        method: "POST",
        body: JSON.stringify(input),
      },
    );
  },

  async getTenantDepositFeeSettings(
    tenantId: string,
  ): Promise<SystemAdminTenantDepositFeeSettings> {
    return httpClient<SystemAdminTenantDepositFeeSettings>(
      `/system-admin/tenants/${tenantId}/deposit-fee`,
    );
  },

  async updateTenantDepositFeeSettings(
    tenantId: string,
    input: UpdateSystemAdminTenantDepositFeeInput,
  ): Promise<SystemAdminTenantDepositFeeSettings> {
    return httpClient<SystemAdminTenantDepositFeeSettings>(
      `/system-admin/tenants/${tenantId}/deposit-fee`,
      {
        method: "PUT",
        body: JSON.stringify(input),
      },
    );
  },

  async getTenantSubscriptionClubSettings(
    tenantId: string,
  ): Promise<SystemAdminTenantSubscriptionClubSettings> {
    return httpClient<SystemAdminTenantSubscriptionClubSettings>(
      `/system-admin/tenants/${tenantId}/subscription-club`,
    );
  },

  async updateTenantSubscriptionClubSettings(
    tenantId: string,
    input: UpdateSystemAdminTenantSubscriptionClubInput,
  ): Promise<SystemAdminTenantSubscriptionClubSettings> {
    return httpClient<SystemAdminTenantSubscriptionClubSettings>(
      `/system-admin/tenants/${tenantId}/subscription-club`,
      {
        method: "PUT",
        body: JSON.stringify(input),
      },
    );
  },

  async getTenantMetaWhatsappStatus(
    tenantId: string,
  ): Promise<SystemAdminTenantMetaWhatsappStatusResponse> {
    return httpClient<SystemAdminTenantMetaWhatsappStatusResponse>(
      `/system-admin/tenants/${tenantId}/whatsapp/meta/status`,
    );
  },

  async updateTenantMetaWhatsappAccess(
    tenantId: string,
    input: UpdateSystemAdminTenantMetaWhatsappAccessInput,
  ): Promise<SystemAdminTenantMetaWhatsappAccessResponse> {
    return httpClient<SystemAdminTenantMetaWhatsappAccessResponse>(
      `/system-admin/tenants/${tenantId}/whatsapp/meta/access`,
      {
        method: "PUT",
        body: JSON.stringify(input),
      },
    );
  },

  async connectTenantMetaWhatsapp(
    tenantId: string,
    input: ConnectSystemAdminTenantMetaWhatsappInput,
  ): Promise<SystemAdminTenantMetaWhatsappStatusResponse> {
    return httpClient<SystemAdminTenantMetaWhatsappStatusResponse>(
      `/system-admin/tenants/${tenantId}/whatsapp/meta/embedded-signup/callback`,
      {
        method: "POST",
        body: JSON.stringify(input),
      },
    );
  },

  async syncTenantMetaWhatsapp(
    tenantId: string,
  ): Promise<SystemAdminTenantMetaWhatsappStatusResponse> {
    return httpClient<SystemAdminTenantMetaWhatsappStatusResponse>(
      `/system-admin/tenants/${tenantId}/whatsapp/meta/sync`,
      {
        method: "POST",
      },
    );
  },

  async sendTenantMetaWhatsappTestMessage(
    tenantId: string,
    input: SendSystemAdminTenantMetaWhatsappTestMessageInput,
  ): Promise<{ ok: true }> {
    return httpClient<{ ok: true }>(
      `/system-admin/tenants/${tenantId}/whatsapp/meta/test-message`,
      {
        method: "POST",
        body: JSON.stringify(input),
      },
    );
  },

  async disconnectTenantMetaWhatsapp(
    tenantId: string,
  ): Promise<SystemAdminTenantMetaWhatsappStatusResponse> {
    return httpClient<SystemAdminTenantMetaWhatsappStatusResponse>(
      `/system-admin/tenants/${tenantId}/whatsapp/meta`,
      {
        method: "DELETE",
      },
    );
  },
};
