import { useQuery } from "@tanstack/react-query";
import { metaWhatsAppBillingService } from "@/services/meta-whatsapp-billing-service";

export function getMetaWhatsAppAuditQueryKey(input: {
  scope: "system-admin" | "tenant";
  month?: string;
  tenantId?: string | null;
  direction?: string | null;
  messageType?: string | null;
  status?: string | null;
  phoneNumberId?: string | null;
  recipientPhone?: string | null;
  page?: number;
  pageSize?: number;
}) {
  return [
    "meta-whatsapp-audit",
    input.scope,
    input.month ?? null,
    input.tenantId ?? null,
    input.direction ?? null,
    input.messageType ?? null,
    input.status ?? null,
    input.phoneNumberId ?? null,
    input.recipientPhone ?? null,
    input.page ?? null,
    input.pageSize ?? null,
  ] as const;
}

export function useMetaWhatsAppAuditQuery(input: {
  scope: "system-admin" | "tenant";
  month?: string;
  tenantId?: string | null;
  direction?: string | null;
  messageType?: string | null;
  status?: string | null;
  phoneNumberId?: string | null;
  recipientPhone?: string | null;
  page?: number;
  pageSize?: number;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: getMetaWhatsAppAuditQueryKey(input),
    queryFn: () =>
      input.scope === "tenant"
        ? metaWhatsAppBillingService.getTenantAuditMessages(input)
        : metaWhatsAppBillingService.getSystemAuditMessages(input),
    retry: false,
    enabled: input.enabled ?? true,
  });
}
