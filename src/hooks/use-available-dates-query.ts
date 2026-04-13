import { useQuery } from "@tanstack/react-query";
import { slotsService } from "@/services/slots-service";
import type { ListAvailableDatesInput } from "@/types/slot";

export function getAvailableDatesQueryKey(input: ListAvailableDatesInput | null) {
  return ["available-dates", input?.professionalId, input?.serviceId, input?.from, input?.to] as const;
}

export function useAvailableDatesQuery(input: ListAvailableDatesInput | null) {
  return useQuery({
    queryKey: getAvailableDatesQueryKey(input),
    queryFn: () => {
      if (!input) {
        throw new Error("Consulta de datas sem filtros completos.");
      }

      return slotsService.listAvailableDates(input);
    },
    enabled: input !== null,
    retry: false,
  });
}
