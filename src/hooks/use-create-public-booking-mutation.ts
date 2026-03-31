import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DateTime } from "luxon";
import { publicBookingService } from "@/services/public-booking-service";
import type { CreatePublicBookingInput, CreatePublicBookingResponse } from "@/types/public-booking";
import type { PublicSlotsResponse } from "@/types/public-booking";

export function useCreatePublicBookingMutation() {
  const queryClient = useQueryClient();

  return useMutation<CreatePublicBookingResponse, unknown, CreatePublicBookingInput>({
    mutationFn: (payload) => publicBookingService.createBooking(payload),
    onSuccess: async (_, variables) => {
      const slotDate = DateTime.fromISO(variables.start, { zone: "utc" }).toISODate();
      const exactQueryKey = slotDate
        ? (["public-slots", variables.slug, variables.serviceId, slotDate] as const)
        : null;

      if (exactQueryKey) {
        queryClient.setQueryData<PublicSlotsResponse | undefined>(exactQueryKey, (current) => {
          if (!current) return current;
          return {
            ...current,
            slots: current.slots.filter((slot) => slot.start !== variables.start),
          };
        });

        await queryClient.invalidateQueries({ queryKey: exactQueryKey });
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ["public-slots"] });
    },
    retry: false,
  });
}
