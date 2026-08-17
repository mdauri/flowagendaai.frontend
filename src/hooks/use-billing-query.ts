import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { billingService } from "@/services/billing-service";
import type { BillingCustomerInput } from "@/types/billing";

export const BILLING_STATUS_QUERY_KEY = ["billing", "status"] as const;
export const BILLING_PAYMENTS_QUERY_KEY = ["billing", "payments"] as const;
export const SYSTEM_ADMIN_BILLING_QUERY_KEY = ["system-admin", "billing"] as const;

export function useBillingStatusQuery() {
  return useQuery({
    queryKey: BILLING_STATUS_QUERY_KEY,
    queryFn: () => billingService.getStatus(),
  });
}

export function useBillingPaymentsQuery() {
  return useQuery({
    queryKey: BILLING_PAYMENTS_QUERY_KEY,
    queryFn: () => billingService.listPayments(),
  });
}

export function useCreateBillingCheckoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => billingService.createCheckout(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: BILLING_STATUS_QUERY_KEY });
    },
  });
}

export function useCancelBillingSubscriptionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => billingService.cancelSubscription(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: BILLING_STATUS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: BILLING_PAYMENTS_QUERY_KEY });
    },
  });
}

export function useUpdateBillingCustomerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: BillingCustomerInput) => billingService.updateBillingCustomer(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: BILLING_STATUS_QUERY_KEY });
    },
  });
}

export function useSystemAdminBillingTenantsQuery() {
  return useQuery({
    queryKey: SYSTEM_ADMIN_BILLING_QUERY_KEY,
    queryFn: () => billingService.listSystemAdminTenants(),
  });
}

export function useSystemAdminTenantBillingQuery(tenantId: string | null) {
  return useQuery({
    queryKey: [...SYSTEM_ADMIN_BILLING_QUERY_KEY, tenantId],
    queryFn: () => billingService.getSystemAdminTenantBilling(tenantId as string),
    enabled: Boolean(tenantId),
  });
}

export function useUpdateSystemAdminTenantBillingCustomerMutation(tenantId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: BillingCustomerInput) => {
      if (!tenantId) {
        throw new Error("Tenant nao selecionado.");
      }
      return billingService.updateSystemAdminTenantBillingCustomer(tenantId, input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SYSTEM_ADMIN_BILLING_QUERY_KEY });
    },
  });
}
