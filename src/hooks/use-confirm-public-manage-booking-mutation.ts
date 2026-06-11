import { useMutation, useQueryClient } from "@tanstack/react-query";
import { publicBookingService } from "@/services/public-booking-service";

interface ConfirmPublicManageBookingVars {
  token: string;
}

export function useConfirmPublicManageBookingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ token }: ConfirmPublicManageBookingVars) =>
      publicBookingService.confirmManagedBooking(token),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["public-manage-booking", variables.token],
      });
    },
    retry: false,
  });
}
