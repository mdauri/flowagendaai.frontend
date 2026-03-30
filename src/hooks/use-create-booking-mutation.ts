import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { bookingsService } from "@/services/bookings-service";
import { isBookingConflictApiError } from "@/types/api";
import type { CreateBookingInput, CreateBookingResponse } from "@/types/booking";

interface UseCreateBookingMutationOptions {
  slotsQueryKey?: QueryKey;
  onConflict?: () => void;
  onSuccess?: (booking: CreateBookingResponse) => void;
}

export function useCreateBookingMutation(options: UseCreateBookingMutationOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateBookingInput) => bookingsService.create(input),
    retry: false,
    onSuccess: async (booking) => {
      if (options.slotsQueryKey) {
        await queryClient.invalidateQueries({
          queryKey: options.slotsQueryKey,
          refetchType: "none",
        });
      }

      options.onSuccess?.(booking);
    },
    onError: (error) => {
      if (isBookingConflictApiError(error)) {
        options.onConflict?.();
      }
    },
  });
}
