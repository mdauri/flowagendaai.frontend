import { useQuery } from "@tanstack/react-query";
import { metaWhatsAppBillingService } from "@/services/meta-whatsapp-billing-service";

export function getMetaWhatsAppTenantSettingsQueryKey(scope: "system-admin" | "tenant", tenantId: string | null) {
  return ["meta-whatsapp-tenant-settings", scope, tenantId] as const;
}

export function useMetaWhatsAppTenantSettingsQuery(input: {
  scope: "system-admin" | "tenant";
  tenantId: string | null;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: getMetaWhatsAppTenantSettingsQueryKey(input.scope, input.tenantId),
    queryFn: () => {
      if (!input.tenantId) {
        throw new Error("tenantId is required");
      }

      return metaWhatsAppBillingService.getTenantSettings(input.tenantId);
    },
    enabled: input.enabled ?? (input.scope === "system-admin" && Boolean(input.tenantId)),
    retry: false,
  });
}
