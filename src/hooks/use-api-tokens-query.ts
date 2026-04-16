import { useQuery } from "@tanstack/react-query";
import { apiTokensService } from "@/services/api-tokens-service";

export const API_TOKENS_QUERY_KEY = ["api-tokens"] as const;

export function useApiTokensQuery() {
  return useQuery({
    queryKey: API_TOKENS_QUERY_KEY,
    queryFn: () => apiTokensService.list(),
  });
}
