import { useQuery } from "@tanstack/react-query";
import { apiTokensService } from "@/services/api-tokens-service";

export const API_TOKENS_QUERY_KEY = ["api-tokens"] as const;

export function useApiTokensQuery(tenantId: string | null) {
  return useQuery({
    queryKey: [...API_TOKENS_QUERY_KEY, tenantId],
    queryFn: () => apiTokensService.list(tenantId as string),
    enabled: Boolean(tenantId),
  });
}
