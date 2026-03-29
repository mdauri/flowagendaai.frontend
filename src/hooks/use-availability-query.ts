import { useQuery } from "@tanstack/react-query";
import { availabilityService } from "@/services/availability-service";

export function useAvailabilityQuery(professionalId: string | null) {
  return useQuery({
    queryKey: ["availability", professionalId],
    queryFn: () => availabilityService.listByProfessionalId(professionalId!),
    enabled: Boolean(professionalId),
    retry: false,
  });
}
