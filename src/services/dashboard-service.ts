import { httpClient } from "@/lib/http-client";
import type { DashboardSummaryResponse } from "@/types/dashboard";

export const dashboardService = {
  async getSummary(date: string): Promise<DashboardSummaryResponse> {
    return httpClient<DashboardSummaryResponse>(
      `/dashboard/summary?date=${encodeURIComponent(date)}`
    );
  },
};
