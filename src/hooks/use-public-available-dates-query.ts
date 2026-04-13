import { useQuery } from "@tanstack/react-query";
import { publicBookingService } from "@/services/public-booking-service";
import type { PublicAvailableDatesResponse } from "@/types/public-booking";

interface UsePublicAvailableDatesParams {
  slug: string;
  serviceId: string;
  from: string;
  to: string;
}

export function usePublicAvailableDatesQuery(params?: UsePublicAvailableDatesParams) {
  const slug = params?.slug;
  const serviceId = params?.serviceId;
  const from = params?.from;
  const to = params?.to;

  return useQuery<PublicAvailableDatesResponse>({
    queryKey: ["public-available-dates", slug, serviceId, from, to],
    queryFn: () => {
      if (!slug || !serviceId || !from || !to) {
        throw new Error("Missing parameters for public available dates query");
      }
      return publicBookingService.listAvailableDates(slug, serviceId, from, to);
    },
    enabled: Boolean(slug && serviceId && from && to),
    retry: false,
    staleTime: 60 * 1000,
  });
}
