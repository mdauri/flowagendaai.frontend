import { useQuery } from "@tanstack/react-query";
import { publicBookingService } from "@/services/public-booking-service";
import type { PublicSlotsResponse } from "@/types/public-booking";

interface UsePublicSlotsParams {
  slug: string;
  serviceId: string;
  date: string;
}

export function usePublicSlotsQuery(params?: UsePublicSlotsParams) {
  const slug = params?.slug;
  const serviceId = params?.serviceId;
  const date = params?.date;

  return useQuery<PublicSlotsResponse>({
    queryKey: ["public-slots", slug, serviceId, date],
    queryFn: () => {
      if (!slug || !serviceId || !date) {
        throw new Error("Missing parameters for public slots query");
      }
      return publicBookingService.listSlots(slug, serviceId, date);
    },
    enabled: Boolean(slug && serviceId && date),
    retry: false,
    staleTime: 60 * 1000,
  });
}
