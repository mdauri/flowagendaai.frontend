import { httpClient } from "@/lib/http-client";
import type {
  BillingCheckoutResponse,
  BillingCheckoutInput,
  BillingCustomerInput,
  BillingOneTimePurchaseInput,
  BillingOneTimePurchaseResponse,
  BillingPaymentsResponse,
  BillingStatusResponse,
  SystemAdminBillingTenantSummary,
} from "@/types/billing";

export const billingService = {
  async getStatus(): Promise<BillingStatusResponse> {
    return httpClient<BillingStatusResponse>("/billing/status");
  },

  async listPayments(): Promise<BillingPaymentsResponse> {
    return httpClient<BillingPaymentsResponse>("/billing/payments");
  },

  async createCheckout(input: BillingCheckoutInput = {}): Promise<BillingCheckoutResponse> {
    return httpClient<BillingCheckoutResponse>("/billing/checkout", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async createOneTimePurchase(input: BillingOneTimePurchaseInput): Promise<BillingOneTimePurchaseResponse> {
    return httpClient<BillingOneTimePurchaseResponse>("/billing/one-time-purchases", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async cancelSubscription(): Promise<BillingStatusResponse> {
    return httpClient<BillingStatusResponse>("/billing/cancel", {
      method: "POST",
    });
  },

  async updateBillingCustomer(input: BillingCustomerInput): Promise<BillingStatusResponse> {
    return httpClient<BillingStatusResponse>("/billing/customer", {
      method: "PUT",
      body: JSON.stringify(input),
    });
  },

  async listSystemAdminTenants(): Promise<{ items: SystemAdminBillingTenantSummary[] }> {
    return httpClient<{ items: SystemAdminBillingTenantSummary[] }>("/system-admin/billing/tenants");
  },

  async getSystemAdminTenantBilling(tenantId: string): Promise<BillingStatusResponse & { payments: BillingPaymentsResponse["items"] }> {
    return httpClient<BillingStatusResponse & { payments: BillingPaymentsResponse["items"] }>(
      `/system-admin/tenants/${tenantId}/billing`,
    );
  },

  async updateSystemAdminTenantBillingCustomer(
    tenantId: string,
    input: BillingCustomerInput,
  ): Promise<BillingStatusResponse & { payments: BillingPaymentsResponse["items"] }> {
    return httpClient<BillingStatusResponse & { payments: BillingPaymentsResponse["items"] }>(
      `/system-admin/tenants/${tenantId}/billing/customer`,
      {
        method: "PUT",
        body: JSON.stringify(input),
      },
    );
  },
};
