import { useQuery } from "@tanstack/react-query";
import { tenantWhatsappService } from "@/services/tenant-whatsapp-service";

export const TENANT_WHATSAPP_QUERY_KEY = ["tenant-whatsapp"] as const;

export function useTenantWhatsappQuery(tenantId: string | null) {
  return useQuery({
    queryKey: [...TENANT_WHATSAPP_QUERY_KEY, tenantId],
    queryFn: () => tenantWhatsappService.get(tenantId as string),
    retry: false,
    enabled: Boolean(tenantId),
  });
}
