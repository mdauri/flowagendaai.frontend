import { useQuery } from "@tanstack/react-query";
import { publicBookingService } from "@/services/public-booking-service";
import type { PublicServiceItem } from "@/types/public-booking";

export function usePublicServicesQuery(slug: string | undefined) {
  return useQuery<PublicServiceItem[]>({
    queryKey: ["public-services", slug],
    queryFn: async () => {
      if (!slug) {
        return [];
      }
      const response = await publicBookingService.listServices(slug);
      return response.services;
    },
    enabled: Boolean(slug),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}
