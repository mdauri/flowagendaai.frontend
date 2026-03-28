import { useMutation, useQueryClient } from "@tanstack/react-query";
import { professionalsService } from "@/services/professionals-service";

export function useCreateProfessionalMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: professionalsService.create,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["professionals"],
      });
    },
  });
}

