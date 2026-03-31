import { useQuery } from "@tanstack/react-query";
import { publicBookingService } from "@/services/public-booking-service";
import type { PublicProfessional } from "@/types/public-booking";

interface UsePublicProfessionalOptions {
  enabled?: boolean;
}

export function usePublicProfessionalQuery(
  slug: string,
  options?: UsePublicProfessionalOptions
) {
  return useQuery<PublicProfessional>({
    queryKey: ["public-professional", slug],
    queryFn: () => publicBookingService.getProfessional(slug),
    enabled: Boolean(slug) && (options?.enabled ?? true),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}
