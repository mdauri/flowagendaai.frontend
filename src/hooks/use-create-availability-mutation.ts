import { useMutation, useQueryClient } from "@tanstack/react-query";
import { availabilityService } from "@/services/availability-service";
import type { CreateAvailabilityBaseInput } from "@/types/base-availability";

interface CreateAvailabilityMutationInput {
  professionalId: string;
  input: CreateAvailabilityBaseInput;
}

export function useCreateAvailabilityMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ professionalId, input }: CreateAvailabilityMutationInput) =>
      availabilityService.create(professionalId, input),
    onSuccess: async (_result, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["availability", variables.professionalId],
      });
    },
  });
}
