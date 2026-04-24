import { describe, expect, it, vi } from "vitest";
import { bookingsService } from "@/services/bookings-service";
import { useCancelBookingMutation } from "@/hooks/use-cancel-booking-mutation";
import { renderWithProviders } from "@/test/render";
import { act, screen } from "@testing-library/react";
import React from "react";

vi.mock("@/services/bookings-service", () => ({
  bookingsService: {
    cancel: vi.fn(),
  },
}));

function CancelButton() {
  const mutation = useCancelBookingMutation();

  return (
    <button
      type="button"
      onClick={() => mutation.mutate({ bookingId: "booking-1", reason: "user" })}
    >
      Cancelar
    </button>
  );
}

describe("useCancelBookingMutation", () => {
  it("invalida queries relacionadas ao cancelamento (dashboard + slots + bookings)", async () => {
    vi.mocked(bookingsService.cancel).mockResolvedValueOnce({
      booking: {
        id: "booking-1",
        status: "CANCELLED",
        cancelledAt: "2026-04-23T11:00:00.000Z",
        cancelReason: "user",
      },
    });

    const { queryClient } = renderWithProviders(<CancelButton />);
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    await act(async () => {
      screen.getByRole("button", { name: "Cancelar" }).click();
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["dashboard-summary"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["available-slots"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["available-dates"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["bookings"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["booking"] });
  });
});

