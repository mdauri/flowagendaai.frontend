import { httpClient } from "@/lib/http-client";
import type {
  ListAvailableDatesInput,
  ListAvailableDatesResponse,
  ListAvailableSlotsInput,
  ListAvailableSlotsResponse,
} from "@/types/slot";

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

  async listAvailableDates(input: ListAvailableDatesInput): Promise<ListAvailableDatesResponse> {
    const searchParams = new URLSearchParams({
      serviceId: input.serviceId,
      from: input.from,
      to: input.to,
    });

    return httpClient<ListAvailableDatesResponse>(
      `/professionals/${input.professionalId}/available-dates?${searchParams.toString()}`
    );
  },
};
