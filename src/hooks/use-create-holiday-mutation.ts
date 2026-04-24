import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HOLIDAYS_QUERY_KEY } from "@/hooks/use-holidays-query";
import { holidaysService } from "@/services/holidays-service";

export function useCreateHolidayMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: holidaysService.create,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: HOLIDAYS_QUERY_KEY });
    },
  });
}

