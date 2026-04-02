import { useMutation, useQueryClient } from "@tanstack/react-query";
import { professionalsService } from "@/services/professionals-service";
import { useToast } from "@/hooks/use-toast";

interface BulkDissociateMutationVars {
  professionalIds: string[];
  serviceId: string;
}

export function useBulkDissociateMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ professionalIds, serviceId }: BulkDissociateMutationVars) =>
      professionalsService.bulkDissociate(professionalIds, serviceId),

    onSuccess: (data) => {
      if (data.succeeded) {
        toast({
          title: "Professionals removed",
          description: `${data.successes} professionals removed successfully`,
          variant: "success",
        });
      } else if (data.partialSuccess) {
        toast({
          title: "Partial success",
          description: `${data.successes} removed, ${data.failures} failed`,
          variant: "warning",
        });
      } else {
        toast({
          title: "Failed to remove",
          description: "Please try again",
          variant: "danger",
        });
      }
      queryClient.invalidateQueries({ queryKey: ["professionals", "with-services"] });
    },

    onError: () => {
      toast({
        title: "Failed to remove",
        description: "An unexpected error occurred",
        variant: "danger",
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["professionals", "with-services"] });
    },
  });
}
