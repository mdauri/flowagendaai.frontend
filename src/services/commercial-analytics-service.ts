import { httpClient } from "@/lib/http-client";
import type { CommercialFunnelResponse } from "@/types/commercial-analytics";

export const commercialAnalyticsService = {
  getFunnel(input?: { from?: string; to?: string }): Promise<CommercialFunnelResponse> {
    const params = new URLSearchParams();
    if (input?.from) params.set("from", input.from);
    if (input?.to) params.set("to", input.to);
    const query = params.toString();
    return httpClient<CommercialFunnelResponse>(
      `/system-admin/commercial-funnel${query ? `?${query}` : ""}`,
    );
  },
};
