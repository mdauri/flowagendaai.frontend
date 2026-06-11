import { useQuery } from "@tanstack/react-query";
import { publicBookingService } from "@/services/public-booking-service";
import type { PublicManageBookingResponse } from "@/types/public-booking";

export function usePublicManageBookingQuery(token: string | undefined) {
  return useQuery<PublicManageBookingResponse>({
    queryKey: ["public-manage-booking", token],
    queryFn: () => publicBookingService.getManagedBooking(token ?? ""),
    enabled: Boolean(token),
    retry: false,
    staleTime: 30 * 1000,
  });
}
