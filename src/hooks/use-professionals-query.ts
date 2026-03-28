import { useQuery } from "@tanstack/react-query";
import { professionalsService } from "@/services/professionals-service";

export function useProfessionalsQuery() {
  return useQuery({
    queryKey: ["professionals"],
    queryFn: professionalsService.list,
  });
}

