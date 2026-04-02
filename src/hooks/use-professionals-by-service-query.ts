import { useQuery } from "@tanstack/react-query";
import { catalogService } from "@/services/catalog-service";
import type { ProfessionalsByServiceResponse } from "@/types/service";

interface UseProfessionalsByServiceOptions {
  enabled?: boolean;
}

export function useProfessionalsByServiceQuery(
  serviceId: string | undefined,
  options?: UseProfessionalsByServiceOptions
) {
  return useQuery<ProfessionalsByServiceResponse>({
    queryKey: ["professionals-by-service", serviceId],
    queryFn: async () => {
      if (!serviceId) {
        return { serviceId: "", serviceName: "", professionals: [] };
      }
      return catalogService.getProfessionalsByService(serviceId);
    },
    enabled: options?.enabled ?? Boolean(serviceId),
    retry: false,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
