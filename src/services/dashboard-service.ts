import { httpClient } from "@/lib/http-client";
import type {
  DashboardSummaryQueryParams,
  DashboardSummaryResponse,
} from "@/types/dashboard";

export const dashboardService = {
  async getSummary(input: DashboardSummaryQueryParams): Promise<DashboardSummaryResponse> {
    const searchParams = new URLSearchParams({ date: input.date });

    if (input.professionalId) {
      searchParams.set("professionalId", input.professionalId);
    }

    if (input.serviceId) {
      searchParams.set("serviceId", input.serviceId);
    }

    if (input.status) {
      searchParams.set("status", input.status);
    }

    if (input.customerName) {
      searchParams.set("customerName", input.customerName);
    }

    if (input.customerPhone) {
      searchParams.set("customerPhone", input.customerPhone);
    }

    return httpClient<DashboardSummaryResponse>(
      `/dashboard/summary?${searchParams.toString()}`
    );
  },
};
