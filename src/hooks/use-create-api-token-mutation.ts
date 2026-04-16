import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiTokensService } from "@/services/api-tokens-service";
import { API_TOKENS_QUERY_KEY } from "@/hooks/use-api-tokens-query";
import type { CreateApiTokenInput } from "@/types/api-token";

export function useCreateApiTokenMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateApiTokenInput) => apiTokensService.create(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: API_TOKENS_QUERY_KEY, exact: false });
    },
  });
}
