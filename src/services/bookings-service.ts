import { httpClient } from "@/lib/http-client";
import type {
  CancelBookingResponse,
  CreateBookingInput,
  CreateBookingResponse,
  GetBookingByIdResponse,
  ListBookingsResponse,
  RescheduleBookingResponse,
} from "@/types/booking";

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

  async reschedule(
    bookingId: string,
    input: { start: string; reason?: string }
  ): Promise<RescheduleBookingResponse> {
    return httpClient<RescheduleBookingResponse>(`/bookings/${bookingId}/reschedule`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async getById(id: string): Promise<GetBookingByIdResponse> {
    return httpClient<GetBookingByIdResponse>(`/bookings/${id}`, { method: "GET" });
  },

  async list(params: {
    from: string;
    to: string;
    professionalId?: string;
    status?: string;
    customerName?: string;
    customerPhone?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ListBookingsResponse> {
    const search = new URLSearchParams({
      from: params.from,
      to: params.to,
    });

    if (params.professionalId) search.set("professionalId", params.professionalId);
    if (params.status) search.set("status", params.status);
    if (params.customerName) search.set("customerName", params.customerName);
    if (params.customerPhone) search.set("customerPhone", params.customerPhone);
    if (typeof params.page === "number") search.set("page", String(params.page));
    if (typeof params.pageSize === "number") search.set("pageSize", String(params.pageSize));

    return httpClient<ListBookingsResponse>(`/bookings?${search.toString()}`, { method: "GET" });
  },
};
