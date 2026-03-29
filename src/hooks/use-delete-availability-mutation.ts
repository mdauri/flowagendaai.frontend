import { useMutation, useQueryClient } from "@tanstack/react-query";
import { availabilityService } from "@/services/availability-service";

interface DeleteAvailabilityMutationInput {
  professionalId: string;
  availabilityId: string;
}

export function useDeleteAvailabilityMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ professionalId, availabilityId }: DeleteAvailabilityMutationInput) =>
      availabilityService.remove(professionalId, availabilityId),
    onSuccess: async (_result, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["availability", variables.professionalId],
      });
    },
  });
}
