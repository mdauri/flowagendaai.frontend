import { useMutation, useQueryClient } from "@tanstack/react-query";
import { availabilityService } from "@/services/availability-service";
import type { UpdateAvailabilityBaseInput } from "@/types/base-availability";

interface UpdateAvailabilityMutationInput {
  professionalId: string;
  input: UpdateAvailabilityBaseInput;
}

export function useUpdateAvailabilityMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ professionalId, input }: UpdateAvailabilityMutationInput) =>
      availabilityService.update(professionalId, input),
    onSuccess: async (_result, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["availability", variables.professionalId],
      });
    },
  });
}
