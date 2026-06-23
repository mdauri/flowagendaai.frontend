import { httpClient } from "@/lib/http-client";
import type {
  MetaWhatsAppAuditMessagesResponse,
  MetaWhatsAppBillingEventsResponse,
  MetaWhatsAppBillingSettings,
  MetaWhatsAppBillingSummaryResponse,
  MetaWhatsAppBillingTenantSummaryResponse,
  MetaWhatsAppPricingRate,
  UpsertMetaWhatsAppBillingSettingsInput,
  UpsertMetaWhatsAppPricingRateInput,
} from "@/types/meta-whatsapp-billing";

export const metaWhatsAppBillingService = {
  async getSystemSummary(params: { month?: string; tenantId?: string | null }): Promise<MetaWhatsAppBillingSummaryResponse> {
    const search = new URLSearchParams();
    if (params.month) search.set("month", params.month);
    if (params.tenantId) search.set("tenantId", params.tenantId);
    return httpClient<MetaWhatsAppBillingSummaryResponse>(`/system-admin/meta-whatsapp/summary?${search.toString()}`);
  },

  async getSystemEvents(params: {
    month?: string;
    tenantId?: string | null;
    category?: string | null;
    status?: string | null;
    phoneNumberId?: string | null;
    recipientPhone?: string | null;
    page?: number;
    pageSize?: number;
  }): Promise<MetaWhatsAppBillingEventsResponse> {
    const search = new URLSearchParams();
    if (params.month) search.set("month", params.month);
    if (params.tenantId) search.set("tenantId", params.tenantId);
    if (params.category) search.set("category", params.category);
    if (params.status) search.set("status", params.status);
    if (params.phoneNumberId) search.set("phoneNumberId", params.phoneNumberId);
    if (params.recipientPhone) search.set("recipientPhone", params.recipientPhone);
    if (params.page) search.set("page", String(params.page));
    if (params.pageSize) search.set("pageSize", String(params.pageSize));
    return httpClient<MetaWhatsAppBillingEventsResponse>(`/system-admin/meta-whatsapp/events?${search.toString()}`);
  },

  async getSystemAuditMessages(params: {
    month?: string;
    tenantId?: string | null;
    direction?: string | null;
    messageType?: string | null;
    status?: string | null;
    phoneNumberId?: string | null;
    recipientPhone?: string | null;
    page?: number;
    pageSize?: number;
  }): Promise<MetaWhatsAppAuditMessagesResponse> {
    const search = new URLSearchParams();
    if (params.month) search.set("month", params.month);
    if (params.tenantId) search.set("tenantId", params.tenantId);
    if (params.direction) search.set("direction", params.direction);
    if (params.messageType) search.set("messageType", params.messageType);
    if (params.status) search.set("status", params.status);
    if (params.phoneNumberId) search.set("phoneNumberId", params.phoneNumberId);
    if (params.recipientPhone) search.set("recipientPhone", params.recipientPhone);
    if (params.page) search.set("page", String(params.page));
    if (params.pageSize) search.set("pageSize", String(params.pageSize));
    return httpClient<MetaWhatsAppAuditMessagesResponse>(`/system-admin/meta-whatsapp/messages?${search.toString()}`);
  },

  async getPricingRates(params: { countryCode?: string; messageCategory?: string }): Promise<{ items: MetaWhatsAppPricingRate[] }> {
    const search = new URLSearchParams();
    if (params.countryCode) search.set("countryCode", params.countryCode);
    if (params.messageCategory) search.set("messageCategory", params.messageCategory);
    return httpClient<{ items: MetaWhatsAppPricingRate[] }>(`/system-admin/meta-whatsapp/pricing-rates?${search.toString()}`);
  },

  async createPricingRate(input: UpsertMetaWhatsAppPricingRateInput): Promise<MetaWhatsAppPricingRate> {
    return httpClient<MetaWhatsAppPricingRate>("/system-admin/meta-whatsapp/pricing-rates", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async updatePricingRate(id: string, input: UpsertMetaWhatsAppPricingRateInput): Promise<MetaWhatsAppPricingRate> {
    return httpClient<MetaWhatsAppPricingRate>(`/system-admin/meta-whatsapp/pricing-rates/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  },

  async deletePricingRate(id: string): Promise<void> {
    await httpClient<void>(`/system-admin/meta-whatsapp/pricing-rates/${id}`, {
      method: "DELETE",
    });
  },

  async getTenantSettings(tenantId: string): Promise<MetaWhatsAppBillingSettings> {
    return httpClient<MetaWhatsAppBillingSettings>(`/system-admin/meta-whatsapp/tenant-settings/${tenantId}`);
  },

  async saveTenantSettings(
    tenantId: string,
    input: UpsertMetaWhatsAppBillingSettingsInput,
  ): Promise<MetaWhatsAppBillingSettings> {
    return httpClient<MetaWhatsAppBillingSettings>(`/system-admin/meta-whatsapp/tenant-settings/${tenantId}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  },

  async getTenantSummary(month?: string): Promise<MetaWhatsAppBillingTenantSummaryResponse> {
    const search = new URLSearchParams();
    if (month) search.set("month", month);
    return httpClient<MetaWhatsAppBillingTenantSummaryResponse>(
      `/api/tenant/meta-whatsapp/summary?${search.toString()}`,
    );
  },

  async getTenantEvents(params: {
    month?: string;
    category?: string | null;
    status?: string | null;
    phoneNumberId?: string | null;
    recipientPhone?: string | null;
    page?: number;
    pageSize?: number;
  }): Promise<MetaWhatsAppBillingEventsResponse> {
    const search = new URLSearchParams();
    if (params.month) search.set("month", params.month);
    if (params.category) search.set("category", params.category);
    if (params.status) search.set("status", params.status);
    if (params.phoneNumberId) search.set("phoneNumberId", params.phoneNumberId);
    if (params.recipientPhone) search.set("recipientPhone", params.recipientPhone);
    if (params.page) search.set("page", String(params.page));
    if (params.pageSize) search.set("pageSize", String(params.pageSize));
    return httpClient<MetaWhatsAppBillingEventsResponse>(`/api/tenant/meta-whatsapp/events?${search.toString()}`);
  },

  async getTenantAuditMessages(params: {
    month?: string;
    direction?: string | null;
    messageType?: string | null;
    status?: string | null;
    phoneNumberId?: string | null;
    recipientPhone?: string | null;
    page?: number;
    pageSize?: number;
  }): Promise<MetaWhatsAppAuditMessagesResponse> {
    const search = new URLSearchParams();
    if (params.month) search.set("month", params.month);
    if (params.direction) search.set("direction", params.direction);
    if (params.messageType) search.set("messageType", params.messageType);
    if (params.status) search.set("status", params.status);
    if (params.phoneNumberId) search.set("phoneNumberId", params.phoneNumberId);
    if (params.recipientPhone) search.set("recipientPhone", params.recipientPhone);
    if (params.page) search.set("page", String(params.page));
    if (params.pageSize) search.set("pageSize", String(params.pageSize));
    return httpClient<MetaWhatsAppAuditMessagesResponse>(`/api/tenant/meta-whatsapp/messages?${search.toString()}`);
  },
};
