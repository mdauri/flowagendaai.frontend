import { httpClient } from "@/lib/http-client";
import type { ListAvailableSlotsInput, ListAvailableSlotsResponse } from "@/types/slot";

export const slotsService = {
  async listAvailable(input: ListAvailableSlotsInput): Promise<ListAvailableSlotsResponse> {
    const searchParams = new URLSearchParams({
      serviceId: input.serviceId,
      date: input.date,
    });

    return httpClient<ListAvailableSlotsResponse>(
      `/professionals/${input.professionalId}/slots?${searchParams.toString()}`
    );
  },
};
