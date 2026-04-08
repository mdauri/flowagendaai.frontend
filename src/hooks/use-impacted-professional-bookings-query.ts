import { useQuery } from "@tanstack/react-query";
import { professionalsService } from "@/services/professionals-service";

export function useImpactedProfessionalBookingsQuery(professionalId?: string) {
  return useQuery({
    queryKey: ["impacted-professional-bookings", professionalId],
    queryFn: () => professionalsService.listImpactedBookings(professionalId ?? ""),
    enabled: Boolean(professionalId),
  });
}
