import { useQuery } from "@tanstack/react-query";
import { commercialAnalyticsService } from "@/services/commercial-analytics-service";

export function useCommercialFunnelQuery(input?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: ["system-admin", "commercial-funnel", input?.from ?? null, input?.to ?? null],
    queryFn: () => commercialAnalyticsService.getFunnel(input),
  });
}
