import { useQuery } from "@tanstack/react-query";
import { professionalsService } from "@/services/professionals-service";

export function useProfessionalsWithServicesQuery() {
  return useQuery({
    queryKey: ["professionals", "with-services"],
    queryFn: () => professionalsService.listWithServices(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: "always",
  });
}
