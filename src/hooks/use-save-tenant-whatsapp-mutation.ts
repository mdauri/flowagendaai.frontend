import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tenantWhatsappService } from "@/services/tenant-whatsapp-service";
import { TENANT_WHATSAPP_QUERY_KEY } from "@/hooks/use-tenant-whatsapp-query";
import type { TenantWhatsappUpsertInput } from "@/types/tenant-whatsapp";

export function useSaveTenantWhatsappMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: TenantWhatsappUpsertInput) => tenantWhatsappService.upsert(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: TENANT_WHATSAPP_QUERY_KEY,
      });
    },
  });
}
