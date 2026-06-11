import { httpClient } from "@/lib/http-client";
import type {
  CreatePublicBookingInput,
  CreatePublicBookingResponse,
  PublicAvailableDatesResponse,
  PublicManageBookingCancelResponse,
  PublicManageBookingConfirmResponse,
  PublicManageBookingResponse,
  PublicProfessional,
  PublicServicesResponse,
  PublicSlotsResponse,
} from "@/types/public-booking";
import type { CancelBookingResponse } from "@/types/booking";

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

  async listAvailableDates(
    slug: string,
    serviceId: string,
    from: string,
    to: string
  ): Promise<PublicAvailableDatesResponse> {
    const searchParams = new URLSearchParams({
      serviceId,
      from,
      to,
    });

    return httpClient<PublicAvailableDatesResponse>(
      `/public/professionals/${slug}/available-dates?${searchParams}`,
      {
        skipAuth: true,
      }
    );
  },

  async createBooking(input: CreatePublicBookingInput): Promise<CreatePublicBookingResponse> {
    return httpClient<CreatePublicBookingResponse>("/public/bookings", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify(input),
    });
  },

  async cancelBooking(
    bookingId: string,
    input: { cancelToken: string; reason?: string }
  ): Promise<CancelBookingResponse> {
    return httpClient<CancelBookingResponse>(`/public/bookings/${bookingId}/cancel`, {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify(input),
    });
  },

  async getManagedBooking(token: string): Promise<PublicManageBookingResponse> {
    return httpClient<PublicManageBookingResponse>(`/public/bookings/manage/${encodeURIComponent(token)}`, {
      skipAuth: true,
    });
  },

  async confirmManagedBooking(token: string): Promise<PublicManageBookingConfirmResponse> {
    return httpClient<PublicManageBookingConfirmResponse>(
      `/public/bookings/manage/${encodeURIComponent(token)}/confirm`,
      {
        method: "POST",
        skipAuth: true,
        body: JSON.stringify({}),
      }
    );
  },

  async cancelManagedBooking(
    token: string,
    input: { reason?: string }
  ): Promise<PublicManageBookingCancelResponse> {
    return httpClient<PublicManageBookingCancelResponse>(`/public/bookings/manage/${encodeURIComponent(token)}/cancel`, {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify(input),
    });
  },
};
