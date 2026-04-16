import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiTokensService } from "@/services/api-tokens-service";
import { API_TOKENS_QUERY_KEY } from "@/hooks/use-api-tokens-query";

export function useRevokeApiTokenMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiTokensService.revoke(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: API_TOKENS_QUERY_KEY });
    },
  });
}
