import { useMutation, useQueryClient } from "@tanstack/react-query";
import { professionalsService } from "@/services/professionals-service";
import { useToast } from "@/hooks/use-toast";

interface AssociateMutationVars {
  professionalId: string;
  serviceId: string;
}

export function useAssociateProfessionalMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ professionalId, serviceId }: AssociateMutationVars) =>
      professionalsService.associateService(professionalId, serviceId),

    onMutate: async ({ professionalId, serviceId }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ["professionals", "with-services"] });

      // Snapshot previous state
      const previousProfessionals = queryClient.getQueryData(["professionals", "with-services"]);

      // Optimistic update
      queryClient.setQueryData(["professionals", "with-services"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          professionals: old.professionals.map((p: any) =>
            p.id === professionalId
              ? {
                  ...p,
                  services: [...p.services, { id: serviceId }],
                  serviceCount: (p.serviceCount || 0) + 1,
                }
              : p
          ),
        };
      });

      return { previousProfessionals };
    },

    onSuccess: () => {
      toast({
        title: "Professional associated",
        description: "Service association saved successfully",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["professionals", "with-services"] });
    },

    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousProfessionals) {
        queryClient.setQueryData(["professionals", "with-services"], context.previousProfessionals);
      }

      toast({
        title: "Failed to associate",
        description: "Please try again",
        variant: "danger",
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["professionals", "with-services"] });
    },
  });
}
