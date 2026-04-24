import { useQuery } from "@tanstack/react-query";
import { holidaysService } from "@/services/holidays-service";

export const HOLIDAYS_QUERY_KEY = ["holidays"] as const;

export function useHolidaysQuery(input: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: [...HOLIDAYS_QUERY_KEY, input.startDate ?? null, input.endDate ?? null],
    queryFn: () => holidaysService.list(input),
  });
}

