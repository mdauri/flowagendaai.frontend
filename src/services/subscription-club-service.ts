import { httpClient } from "@/lib/http-client";
import type {
  ActiveCustomerSubscriptionResponse,
  CreateCustomerSubscriptionInput,
  CreateSubscriptionPlanInput,
  GetCustomerSubscriptionResponse,
  GetSubscriptionPlanResponse,
  ListCustomersResponse,
  ListCustomerSubscriptionsResponse,
  ListSubscriptionPlansResponse,
  ListSubscriptionUsagesResponse,
  MarkSubscriptionPaidInput,
  UpdateCustomerSubscriptionInput,
  UpdateSubscriptionPlanInput,
  ValidateSubscriptionUsageInput,
  ValidateSubscriptionUsageResponse,
} from "@/types/subscription-club";

export const subscriptionClubService = {
  async listCustomers(): Promise<ListCustomersResponse> {
    return httpClient<ListCustomersResponse>("/customers");
  },

  async createPlan(input: CreateSubscriptionPlanInput): Promise<GetSubscriptionPlanResponse> {
    return httpClient<GetSubscriptionPlanResponse>("/subscription-plans", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async listPlans(): Promise<ListSubscriptionPlansResponse> {
    return httpClient<ListSubscriptionPlansResponse>("/subscription-plans");
  },

  async getPlan(id: string): Promise<GetSubscriptionPlanResponse> {
    return httpClient<GetSubscriptionPlanResponse>(`/subscription-plans/${id}`);
  },

  async updatePlan(
    id: string,
    input: UpdateSubscriptionPlanInput
  ): Promise<GetSubscriptionPlanResponse> {
    return httpClient<GetSubscriptionPlanResponse>(`/subscription-plans/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  async deactivatePlan(id: string): Promise<GetSubscriptionPlanResponse> {
    return httpClient<GetSubscriptionPlanResponse>(`/subscription-plans/${id}`, {
      method: "DELETE",
    });
  },

  async createCustomerSubscription(
    input: CreateCustomerSubscriptionInput
  ): Promise<GetCustomerSubscriptionResponse> {
    return httpClient<GetCustomerSubscriptionResponse>("/customer-subscriptions", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async listCustomerSubscriptions(): Promise<ListCustomerSubscriptionsResponse> {
    return httpClient<ListCustomerSubscriptionsResponse>("/customer-subscriptions");
  },

  async getCustomerSubscription(id: string): Promise<GetCustomerSubscriptionResponse> {
    return httpClient<GetCustomerSubscriptionResponse>(`/customer-subscriptions/${id}`);
  },

  async updateCustomerSubscription(
    id: string,
    input: UpdateCustomerSubscriptionInput
  ): Promise<GetCustomerSubscriptionResponse> {
    return httpClient<GetCustomerSubscriptionResponse>(`/customer-subscriptions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  async activateCustomerSubscription(id: string): Promise<GetCustomerSubscriptionResponse> {
    return httpClient<GetCustomerSubscriptionResponse>(
      `/customer-subscriptions/${id}/activate`,
      { method: "POST" }
    );
  },

  async pauseCustomerSubscription(id: string): Promise<GetCustomerSubscriptionResponse> {
    return httpClient<GetCustomerSubscriptionResponse>(
      `/customer-subscriptions/${id}/pause`,
      { method: "POST" }
    );
  },

  async cancelCustomerSubscription(id: string): Promise<GetCustomerSubscriptionResponse> {
    return httpClient<GetCustomerSubscriptionResponse>(
      `/customer-subscriptions/${id}/cancel`,
      { method: "POST" }
    );
  },

  async markPaid(
    id: string,
    input: MarkSubscriptionPaidInput
  ): Promise<GetCustomerSubscriptionResponse> {
    return httpClient<GetCustomerSubscriptionResponse>(
      `/customer-subscriptions/${id}/mark-paid`,
      {
        method: "POST",
        body: JSON.stringify(input),
      }
    );
  },

  async listUsages(id: string): Promise<ListSubscriptionUsagesResponse> {
    return httpClient<ListSubscriptionUsagesResponse>(
      `/customer-subscriptions/${id}/usages`
    );
  },

  async getActiveCustomerSubscription(
    customerId: string
  ): Promise<ActiveCustomerSubscriptionResponse> {
    return httpClient<ActiveCustomerSubscriptionResponse>(
      `/customers/${customerId}/subscriptions/active`
    );
  },

  async validateUsage(
    input: ValidateSubscriptionUsageInput
  ): Promise<ValidateSubscriptionUsageResponse> {
    return httpClient<ValidateSubscriptionUsageResponse>("/subscription-usage/validate", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};
