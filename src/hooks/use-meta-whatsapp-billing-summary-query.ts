import { useQuery } from "@tanstack/react-query";
import { metaWhatsAppBillingService } from "@/services/meta-whatsapp-billing-service";

export function getMetaWhatsAppBillingSummaryQueryKey(input: {
  scope: "system-admin" | "tenant";
  month?: string;
  tenantId?: string | null;
}) {
  return ["meta-whatsapp-billing-summary", input.scope, input.month ?? null, input.tenantId ?? null] as const;
}

export function useMetaWhatsAppBillingSummaryQuery(input: {
  scope: "system-admin" | "tenant";
  month?: string;
  tenantId?: string | null;
}) {
  return useQuery({
    queryKey: getMetaWhatsAppBillingSummaryQueryKey(input),
    queryFn: () =>
      input.scope === "tenant"
        ? metaWhatsAppBillingService.getTenantSummary(input.month)
        : metaWhatsAppBillingService.getSystemSummary(input),
    retry: false,
  });
}
