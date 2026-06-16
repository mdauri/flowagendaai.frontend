import { useMutation, useQueryClient } from "@tanstack/react-query";
import { waitlistService } from "@/services/waitlist-service";
import type { UpdateWaitlistInput } from "@/types/waitlist";

export function useUpdateWaitlistMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateWaitlistInput }) =>
      waitlistService.update(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["waitlist"] });
    },
  });
}
