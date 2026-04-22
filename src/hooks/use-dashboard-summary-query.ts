import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard-service";
import type { DashboardSummaryQueryParams } from "@/types/dashboard";

export function getDashboardSummaryQueryKey(input: DashboardSummaryQueryParams) {
  return [
    "dashboard-summary",
    input.date,
    input.professionalId ?? null,
    input.serviceId ?? null,
    input.status ?? null,
    input.customerName ?? null,
    input.customerPhone ?? null,
  ] as const;
}

export function useDashboardSummaryQuery(input: DashboardSummaryQueryParams) {
  return useQuery({
    queryKey: getDashboardSummaryQueryKey(input),
    queryFn: () => dashboardService.getSummary(input),
    retry: false,
  });
}
