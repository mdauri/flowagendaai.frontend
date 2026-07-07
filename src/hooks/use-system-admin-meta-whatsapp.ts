import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { systemAdminService } from "@/services/system-admin-service";
import type {
  ConnectSystemAdminTenantMetaWhatsappInput,
  SendSystemAdminTenantMetaWhatsappTestMessageInput,
  UpdateSystemAdminTenantMetaWhatsappAccessInput,
} from "@/types/system-admin";

export const SYSTEM_ADMIN_META_WHATSAPP_QUERY_KEY = ["system-admin", "meta-whatsapp"] as const;

export function useSystemAdminMetaWhatsappStatusQuery(tenantId: string | null) {
  return useQuery({
    queryKey: [...SYSTEM_ADMIN_META_WHATSAPP_QUERY_KEY, tenantId],
    queryFn: () => systemAdminService.getTenantMetaWhatsappStatus(tenantId as string),
    enabled: Boolean(tenantId),
  });
}

function invalidateMetaWhatsappStatus(queryClient: ReturnType<typeof useQueryClient>) {
  return queryClient.invalidateQueries({
    queryKey: SYSTEM_ADMIN_META_WHATSAPP_QUERY_KEY,
  });
}

export function useConnectSystemAdminMetaWhatsappMutation(tenantId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ConnectSystemAdminTenantMetaWhatsappInput) =>
      systemAdminService.connectTenantMetaWhatsapp(tenantId as string, input),
    onSuccess: async () => {
      await invalidateMetaWhatsappStatus(queryClient);
    },
  });
}

export function useUpdateSystemAdminMetaWhatsappAccessMutation(
  tenantId: string | null,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateSystemAdminTenantMetaWhatsappAccessInput) =>
      systemAdminService.updateTenantMetaWhatsappAccess(tenantId as string, input),
    onSuccess: async () => {
      await invalidateMetaWhatsappStatus(queryClient);
    },
  });
}

export function useSyncSystemAdminMetaWhatsappMutation(tenantId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => systemAdminService.syncTenantMetaWhatsapp(tenantId as string),
    onSuccess: async () => {
      await invalidateMetaWhatsappStatus(queryClient);
    },
  });
}

export function useSendSystemAdminMetaWhatsappTestMessageMutation(tenantId: string | null) {
  return useMutation({
    mutationFn: (input: SendSystemAdminTenantMetaWhatsappTestMessageInput) =>
      systemAdminService.sendTenantMetaWhatsappTestMessage(tenantId as string, input),
  });
}

export function useDisconnectSystemAdminMetaWhatsappMutation(tenantId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => systemAdminService.disconnectTenantMetaWhatsapp(tenantId as string),
    onSuccess: async () => {
      await invalidateMetaWhatsappStatus(queryClient);
    },
  });
}
