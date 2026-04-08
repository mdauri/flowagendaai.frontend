import { useMutation, useQueryClient } from "@tanstack/react-query";
import { professionalsService } from "@/services/professionals-service";
import type { UpdateProfessionalInput } from "@/types/professional";

export function useUpdateProfessionalMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      professionalId,
      input,
    }: {
      professionalId: string;
      input: UpdateProfessionalInput;
    }) => professionalsService.update(professionalId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["professionals"],
      });
    },
  });
}
