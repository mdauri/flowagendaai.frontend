import { httpClient } from "@/lib/http-client";
import type { CancelBookingResponse, CreateBookingInput, CreateBookingResponse } from "@/types/booking";

export const bookingsService = {
  async create(input: CreateBookingInput): Promise<CreateBookingResponse> {
    const { idempotencyKey, ...payload } = input;

    return httpClient<CreateBookingResponse>("/bookings", {
      method: "POST",
      headers: idempotencyKey
        ? {
            "Idempotency-Key": idempotencyKey,
          }
        : undefined,
      body: JSON.stringify(payload),
    });
  },

  async cancel(bookingId: string, input: { reason?: string }): Promise<CancelBookingResponse> {
    return httpClient<CancelBookingResponse>(`/bookings/${bookingId}/cancel`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};
