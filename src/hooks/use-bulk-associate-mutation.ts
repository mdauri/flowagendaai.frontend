import { useMutation, useQueryClient } from "@tanstack/react-query";
import { professionalsService } from "@/services/professionals-service";
import { useToast } from "@/hooks/use-toast";

interface BulkAssociateMutationVars {
  professionalIds: string[];
  serviceId: string;
}

export function useBulkAssociateMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ professionalIds, serviceId }: BulkAssociateMutationVars) =>
      professionalsService.bulkAssociate(professionalIds, serviceId),

    onSuccess: (data) => {
      if (data.succeeded) {
        toast({
          title: "Professionals associated",
          description: `${data.successes} professionals associated successfully`,
          variant: "success",
        });
      } else if (data.partialSuccess) {
        toast({
          title: "Partial success",
          description: `${data.successes} associated, ${data.failures} failed`,
          variant: "warning",
        });
      } else {
        toast({
          title: "Failed to associate",
          description: "Please try again",
          variant: "danger",
        });
      }
      queryClient.invalidateQueries({ queryKey: ["professionals", "with-services"] });
    },

    onError: () => {
      toast({
        title: "Failed to associate",
        description: "An unexpected error occurred",
        variant: "danger",
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["professionals", "with-services"] });
    },
  });
}
