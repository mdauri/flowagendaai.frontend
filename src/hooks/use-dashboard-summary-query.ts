import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard-service";

export function getDashboardSummaryQueryKey(date: string) {
  return ["dashboard-summary", date] as const;
}

export function useDashboardSummaryQuery(date: string) {
  return useQuery({
    queryKey: getDashboardSummaryQueryKey(date),
    queryFn: () => dashboardService.getSummary(date),
    retry: false,
  });
}
