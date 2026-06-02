import { httpClient } from "@/lib/http-client";
import type {
  TenantWhatsappIntegration,
  TenantWhatsappUpsertInput,
} from "@/types/tenant-whatsapp";

export const tenantWhatsappService = {
  async get(tenantId: string): Promise<TenantWhatsappIntegration> {
    const query = new URLSearchParams({ tenantId });
    return httpClient<TenantWhatsappIntegration>(`/api/tenant/whatsapp?${query.toString()}`);
  },

  async upsert(input: TenantWhatsappUpsertInput): Promise<TenantWhatsappIntegration> {
    return httpClient<TenantWhatsappIntegration>("/api/tenant/whatsapp", {
      method: "PUT",
      body: JSON.stringify(input),
    });
  },
};
