import { useQuery } from "@tanstack/react-query";
import { metaWhatsAppBillingService } from "@/services/meta-whatsapp-billing-service";

export function getMetaWhatsAppBillingEventsQueryKey(input: {
  scope: "system-admin" | "tenant";
  month?: string;
  tenantId?: string | null;
  category?: string | null;
  status?: string | null;
  phoneNumberId?: string | null;
  recipientPhone?: string | null;
  page?: number;
  pageSize?: number;
}) {
  return [
    "meta-whatsapp-billing-events",
    input.scope,
    input.month ?? null,
    input.tenantId ?? null,
    input.category ?? null,
    input.status ?? null,
    input.phoneNumberId ?? null,
    input.recipientPhone ?? null,
    input.page ?? null,
    input.pageSize ?? null,
  ] as const;
}

export function useMetaWhatsAppBillingEventsQuery(input: {
  scope: "system-admin" | "tenant";
  month?: string;
  tenantId?: string | null;
  category?: string | null;
  status?: string | null;
  phoneNumberId?: string | null;
  recipientPhone?: string | null;
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: getMetaWhatsAppBillingEventsQueryKey(input),
    queryFn: () =>
      input.scope === "tenant"
        ? metaWhatsAppBillingService.getTenantEvents(input)
        : metaWhatsAppBillingService.getSystemEvents(input),
    retry: false,
  });
}
