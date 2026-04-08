import { useMutation, useQueryClient } from "@tanstack/react-query";
import { professionalsService } from "@/services/professionals-service";

export function useDeleteProfessionalMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (professionalId: string) => professionalsService.delete(professionalId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["professionals"],
      });
    },
  });
}
