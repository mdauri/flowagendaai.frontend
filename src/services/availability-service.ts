import { httpClient } from "@/lib/http-client";
import type {
  AvailabilityBaseResponse,
  CreateAvailabilityBaseInput,
  ListAvailabilityBaseResponse,
  UpdateAvailabilityBaseInput,
} from "@/types/base-availability";

export const availabilityService = {
  async listByProfessionalId(professionalId: string): Promise<ListAvailabilityBaseResponse> {
    return httpClient<ListAvailabilityBaseResponse>(`/professionals/${professionalId}/availability`);
  },

  async create(
    professionalId: string,
    input: CreateAvailabilityBaseInput
  ): Promise<AvailabilityBaseResponse> {
    return httpClient<AvailabilityBaseResponse>(`/professionals/${professionalId}/availability`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async update(
    professionalId: string,
    input: UpdateAvailabilityBaseInput
  ): Promise<AvailabilityBaseResponse> {
    return httpClient<AvailabilityBaseResponse>(
      `/professionals/${professionalId}/availability/${input.id}`,
      {
        method: "PUT",
        body: JSON.stringify({
          dayOfWeek: input.dayOfWeek,
          startTime: input.startTime,
          endTime: input.endTime,
        }),
      }
    );
  },

  async remove(professionalId: string, availabilityId: string): Promise<void> {
    await httpClient<undefined>(`/professionals/${professionalId}/availability/${availabilityId}`, {
      method: "DELETE",
    });
  },
};
