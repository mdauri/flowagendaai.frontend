import { useQuery } from "@tanstack/react-query";
import { slotsService } from "@/services/slots-service";
import type { ListAvailableSlotsInput } from "@/types/slot";

export function getAvailableSlotsQueryKey(input: ListAvailableSlotsInput | null) {
  return ["available-slots", input?.professionalId, input?.serviceId, input?.date] as const;
}

export function useAvailableSlotsQuery(input: ListAvailableSlotsInput | null) {
  return useQuery({
    queryKey: getAvailableSlotsQueryKey(input),
    queryFn: () => {
      if (!input) {
        throw new Error("Consulta de slots sem filtros completos.");
      }

      return slotsService.listAvailable(input);
    },
    enabled: input !== null,
  });
}
