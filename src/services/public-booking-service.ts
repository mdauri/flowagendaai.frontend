import { httpClient } from "@/lib/http-client";
import type {
  CreatePublicBookingInput,
  CreatePublicBookingResponse,
  PublicProfessional,
  PublicServicesResponse,
  PublicSlotsResponse,
} from "@/types/public-booking";

export const publicBookingService = {
  async getProfessional(slug: string): Promise<PublicProfessional> {
    return httpClient<PublicProfessional>(`/public/professionals/${slug}`, { skipAuth: true });
  },

  async listServices(slug: string): Promise<PublicServicesResponse> {
    return httpClient<PublicServicesResponse>(`/public/professionals/${slug}/services`, {
      skipAuth: true,
    });
  },

  async listSlots(
    slug: string,
    serviceId: string,
    date: string
  ): Promise<PublicSlotsResponse> {
    const searchParams = new URLSearchParams({
      serviceId,
      date,
    });

    return httpClient<PublicSlotsResponse>(`/public/professionals/${slug}/slots?${searchParams}`, {
      skipAuth: true,
    });
  },

  async createBooking(input: CreatePublicBookingInput): Promise<CreatePublicBookingResponse> {
    return httpClient<CreatePublicBookingResponse>("/public/bookings", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify(input),
    });
  },
};
