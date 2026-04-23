import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingsService } from "@/services/bookings-service";

interface RescheduleBookingVars {
  bookingId: string;
  start: string;
  reason?: string;
}

export function useRescheduleBookingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, start, reason }: RescheduleBookingVars) =>
      bookingsService.reschedule(bookingId, { start, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["booking"] });
    },
  });
}

