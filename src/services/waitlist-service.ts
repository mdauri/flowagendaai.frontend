import { httpClient } from "@/lib/http-client";
import type {
  CreateWaitlistInput,
  ListWaitlistResponse,
  UpdateWaitlistInput,
  WaitlistFilters,
  WaitlistMutationResponse,
} from "@/types/waitlist";

function appendFilter(searchParams: URLSearchParams, key: string, value?: string) {
  if (value && value.trim()) {
    searchParams.set(key, value.trim());
  }
}

export const waitlistService = {
  async list(filters: WaitlistFilters = {}): Promise<ListWaitlistResponse> {
    const searchParams = new URLSearchParams();

    appendFilter(searchParams, "customerPhone", filters.customerPhone);
    appendFilter(searchParams, "serviceId", filters.serviceId);
    appendFilter(searchParams, "employeeId", filters.employeeId);
    appendFilter(searchParams, "preferredDate", filters.preferredDate);
    appendFilter(searchParams, "preferredPeriod", filters.preferredPeriod);
    appendFilter(searchParams, "status", filters.status);

    const search = searchParams.toString();

    return httpClient<ListWaitlistResponse>(
      search ? `/admin/waitlist?${search}` : "/admin/waitlist",
      {
        method: "GET",
      },
    );
  },

  async create(input: CreateWaitlistInput): Promise<WaitlistMutationResponse> {
    return httpClient<WaitlistMutationResponse>("/admin/waitlist", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async update(
    id: string,
    input: UpdateWaitlistInput,
  ): Promise<WaitlistMutationResponse> {
    return httpClient<WaitlistMutationResponse>(`/admin/waitlist/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  async remove(id: string): Promise<WaitlistMutationResponse> {
    return httpClient<WaitlistMutationResponse>(`/admin/waitlist/${id}`, {
      method: "DELETE",
    });
  },
};
