import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HOLIDAYS_QUERY_KEY } from "@/hooks/use-holidays-query";
import { holidaysService } from "@/services/holidays-service";
import type { UpdateHolidayInput } from "@/types/holiday";

export function useUpdateHolidayMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateHolidayInput }) =>
      holidaysService.update(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: HOLIDAYS_QUERY_KEY });
    },
  });
}

