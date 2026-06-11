import { useMutation, useQueryClient } from "@tanstack/react-query";
import { publicBookingService } from "@/services/public-booking-service";

interface CancelPublicManageBookingVars {
  token: string;
  reason?: string;
}

export function useCancelPublicManageBookingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ token, reason }: CancelPublicManageBookingVars) =>
      publicBookingService.cancelManagedBooking(token, { reason }),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["public-manage-booking", variables.token],
      });
    },
    retry: false,
  });
}
