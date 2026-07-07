import { httpClient } from "@/lib/http-client";
import type {
  ConnectSystemAdminTenantMetaWhatsappInput,
  SendSystemAdminTenantMetaWhatsappTestMessageInput,
  SystemAdminTenantMetaWhatsappStatusResponse,
} from "@/types/system-admin";

export const tenantMetaWhatsappService = {
  async getStatus(): Promise<SystemAdminTenantMetaWhatsappStatusResponse> {
    return httpClient<SystemAdminTenantMetaWhatsappStatusResponse>(
      "/api/tenant/whatsapp/meta/status",
    );
  },

  async connect(
    input: ConnectSystemAdminTenantMetaWhatsappInput,
  ): Promise<SystemAdminTenantMetaWhatsappStatusResponse> {
    return httpClient<SystemAdminTenantMetaWhatsappStatusResponse>(
      "/api/tenant/whatsapp/meta/embedded-signup/callback",
      {
        method: "POST",
        body: JSON.stringify(input),
      },
    );
  },

  async sync(): Promise<SystemAdminTenantMetaWhatsappStatusResponse> {
    return httpClient<SystemAdminTenantMetaWhatsappStatusResponse>(
      "/api/tenant/whatsapp/meta/sync",
      {
        method: "POST",
      },
    );
  },

  async sendTestMessage(
    input: SendSystemAdminTenantMetaWhatsappTestMessageInput,
  ): Promise<{ ok: true }> {
    return httpClient<{ ok: true }>(
      "/api/tenant/whatsapp/meta/test-message",
      {
        method: "POST",
        body: JSON.stringify(input),
      },
    );
  },

  async disconnect(): Promise<SystemAdminTenantMetaWhatsappStatusResponse> {
    return httpClient<SystemAdminTenantMetaWhatsappStatusResponse>(
      "/api/tenant/whatsapp/meta",
      {
        method: "DELETE",
      },
    );
  },
};
