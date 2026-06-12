import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingsService } from "@/services/bookings-service";

export function useMarkBookingDepositPaidMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, notes }: { bookingId: string; notes?: string }) =>
      bookingsService.markDepositPaid(bookingId, { notes }),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["bookings"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] }),
        queryClient.invalidateQueries({ queryKey: ["booking", variables.bookingId] }),
      ]);
    },
  });
}
