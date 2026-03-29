import { useQuery } from "@tanstack/react-query";
import { slotsService } from "@/services/slots-service";
import type { ListAvailableSlotsInput } from "@/types/slot";

export function useAvailableSlotsQuery(input: ListAvailableSlotsInput | null) {
  return useQuery({
    queryKey: ["available-slots", input?.professionalId, input?.serviceId, input?.date],
    queryFn: () => {
      if (!input) {
        throw new Error("Consulta de slots sem filtros completos.");
      }

      return slotsService.listAvailable(input);
    },
    enabled: input !== null,
  });
}
