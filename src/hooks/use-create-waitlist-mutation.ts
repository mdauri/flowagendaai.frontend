import { useMutation, useQueryClient } from "@tanstack/react-query";
import { waitlistService } from "@/services/waitlist-service";
import type { CreateWaitlistInput } from "@/types/waitlist";

export function useCreateWaitlistMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateWaitlistInput) => waitlistService.create(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["waitlist"] });
    },
  });
}
