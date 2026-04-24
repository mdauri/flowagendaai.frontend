import { httpClient } from "@/lib/http-client";
import type { CreateHolidayInput, Holiday, UpdateHolidayInput } from "@/types/holiday";

interface ListHolidaysResponse {
  holidays: Holiday[];
}

export const holidaysService = {
  async list(input: { startDate?: string; endDate?: string } = {}) {
    const params = new URLSearchParams();
    if (input.startDate) params.set("startDate", input.startDate);
    if (input.endDate) params.set("endDate", input.endDate);

    const query = params.toString();
    return httpClient<ListHolidaysResponse>(`/holidays${query ? `?${query}` : ""}`);
  },

  async create(input: CreateHolidayInput) {
    return httpClient<Holiday>("/holidays", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async update(id: string, input: UpdateHolidayInput) {
    return httpClient<Holiday>(`/holidays/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  },

  async remove(id: string) {
    return httpClient<{ message: string }>(`/holidays/${id}`, {
      method: "DELETE",
    });
  },
};

