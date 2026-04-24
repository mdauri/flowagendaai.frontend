import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingsService } from "@/services/bookings-service";

interface CancelBookingVars {
  bookingId: string;
  reason?: string;
}

export function useCancelBookingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, reason }: CancelBookingVars) =>
      bookingsService.cancel(bookingId, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["available-slots"] });
      queryClient.invalidateQueries({ queryKey: ["available-dates"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["booking"] });
    },
  });
}
