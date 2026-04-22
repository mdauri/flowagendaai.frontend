import { useMutation } from "@tanstack/react-query";
import { publicBookingService } from "@/services/public-booking-service";

interface CancelPublicBookingVars {
  bookingId: string;
  cancelToken: string;
  reason?: string;
}

export function useCancelPublicBookingMutation() {
  return useMutation({
    mutationFn: ({ bookingId, cancelToken, reason }: CancelPublicBookingVars) =>
      publicBookingService.cancelBooking(bookingId, { cancelToken, reason }),
  });
}

