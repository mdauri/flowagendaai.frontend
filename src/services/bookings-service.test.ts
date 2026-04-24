import { describe, expect, it, vi } from "vitest";
import { bookingsService } from "@/services/bookings-service";
import { httpClient } from "@/lib/http-client";

vi.mock("@/lib/http-client", () => ({
  httpClient: vi.fn(),
}));

describe("bookingsService pending methods", () => {
  it("createPending chama /bookings/pending com payload esperado", async () => {
    vi.mocked(httpClient).mockResolvedValueOnce({
      booking: {
        id: "booking-1",
        status: "PENDING",
        start: "2026-05-10T14:00:00.000Z",
        end: "2026-05-10T14:30:00.000Z",
        pendingExpiresAt: "2026-05-10T14:10:00.000Z",
      },
    });

    await bookingsService.createPending({
      professionalId: "professional-1",
      serviceId: "service-1",
      start: "2026-05-10T14:00:00.000Z",
    });

    expect(httpClient).toHaveBeenCalledWith("/bookings/pending", {
      method: "POST",
      body: JSON.stringify({
        professionalId: "professional-1",
        serviceId: "service-1",
        start: "2026-05-10T14:00:00.000Z",
      }),
    });
  });

  it("confirmPending chama /bookings/:bookingId/confirm", async () => {
    vi.mocked(httpClient).mockResolvedValueOnce({
      booking: {
        id: "booking-1",
        status: "CONFIRMED",
      },
    });

    await bookingsService.confirmPending("booking-1");

    expect(httpClient).toHaveBeenCalledWith("/bookings/booking-1/confirm", {
      method: "POST",
    });
  });
});
