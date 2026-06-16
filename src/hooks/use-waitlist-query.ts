import { useQuery } from "@tanstack/react-query";
import { waitlistService } from "@/services/waitlist-service";
import type { WaitlistFilters } from "@/types/waitlist";

export function useWaitlistQuery(filters: WaitlistFilters) {
  return useQuery({
    queryKey: ["waitlist", filters],
    queryFn: () => waitlistService.list(filters),
  });
}
