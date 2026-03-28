import { useQuery } from "@tanstack/react-query";
import { servicesService } from "@/services/services-service";

export function useServicesQuery() {
  return useQuery({
    queryKey: ["services"],
    queryFn: servicesService.list,
  });
}

