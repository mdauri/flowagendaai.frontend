import { useMutation, useQueryClient } from "@tanstack/react-query";
import { servicesService } from "@/services/services-service";

export function useCreateServiceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: servicesService.create,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["services"],
      });
    },
  });
}

