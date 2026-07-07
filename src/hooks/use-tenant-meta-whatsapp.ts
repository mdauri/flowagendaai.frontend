import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tenantMetaWhatsappService } from "@/services/tenant-meta-whatsapp-service";
import type {
  ConnectSystemAdminTenantMetaWhatsappInput,
  SendSystemAdminTenantMetaWhatsappTestMessageInput,
} from "@/types/system-admin";

export const TENANT_META_WHATSAPP_QUERY_KEY = ["tenant", "meta-whatsapp"] as const;

function invalidateTenantMetaWhatsappStatus(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  return queryClient.invalidateQueries({
    queryKey: TENANT_META_WHATSAPP_QUERY_KEY,
  });
}

export function useTenantMetaWhatsappStatusQuery(enabled = true) {
  return useQuery({
    queryKey: TENANT_META_WHATSAPP_QUERY_KEY,
    queryFn: () => tenantMetaWhatsappService.getStatus(),
    enabled,
  });
}

export function useConnectTenantMetaWhatsappMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ConnectSystemAdminTenantMetaWhatsappInput) =>
      tenantMetaWhatsappService.connect(input),
    onSuccess: async () => {
      await invalidateTenantMetaWhatsappStatus(queryClient);
    },
  });
}

export function useSyncTenantMetaWhatsappMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => tenantMetaWhatsappService.sync(),
    onSuccess: async () => {
      await invalidateTenantMetaWhatsappStatus(queryClient);
    },
  });
}

export function useSendTenantMetaWhatsappTestMessageMutation() {
  return useMutation({
    mutationFn: (input: SendSystemAdminTenantMetaWhatsappTestMessageInput) =>
      tenantMetaWhatsappService.sendTestMessage(input),
  });
}

export function useDisconnectTenantMetaWhatsappMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => tenantMetaWhatsappService.disconnect(),
    onSuccess: async () => {
      await invalidateTenantMetaWhatsappStatus(queryClient);
    },
  });
}
