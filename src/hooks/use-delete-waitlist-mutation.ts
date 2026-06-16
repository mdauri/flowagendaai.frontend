import { useMutation, useQueryClient } from "@tanstack/react-query";
import { waitlistService } from "@/services/waitlist-service";

export function useDeleteWaitlistMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => waitlistService.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["waitlist"] });
    },
  });
}
