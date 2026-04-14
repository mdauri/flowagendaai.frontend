import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BookingConfirmationPanel } from "@/components/slots/booking-confirmation-panel";

const singleDaySlot = {
  start: "2026-04-18T08:00:00.000Z",
  end: "2026-04-18T09:00:00.000Z",
};

const multiDaySlot = {
  start: "2026-04-18T15:00:00.000Z",
  end: "2026-04-22T15:00:00.000Z",
  daysAffected: [
    { date: "2026-04-18", start: "2026-04-18T15:00:00.000Z", end: "2026-04-18T18:00:00.000Z", durationMinutes: 180 },
    { date: "2026-04-21", start: "2026-04-21T08:00:00.000Z", end: "2026-04-21T18:00:00.000Z", durationMinutes: 600 },
    { date: "2026-04-22", start: "2026-04-22T08:00:00.000Z", end: "2026-04-22T15:00:00.000Z", durationMinutes: 420 },
  ],
};

describe("BookingConfirmationPanel", () => {
  const baseProps = {
    state: "idle" as const,
    tenantTimezone: "America/Sao_Paulo",
    professionalName: "Ana Silva",
    serviceName: "Consultoria",
    canConfirm: true,
    onConfirm: vi.fn(),
    onRetry: vi.fn(),
    onRefreshSlots: vi.fn(),
    onResetSuccess: vi.fn(),
    confirmedBooking: null,
  };

  it("renders MultiDaySummary for multi-day slots", () => {
    render(<BookingConfirmationPanel {...baseProps} selectedSlot={multiDaySlot} />);

    expect(screen.getByText("3d")).toBeInTheDocument();
    expect(screen.getByText(/Dias afetados/i)).toBeInTheDocument();
  });

  it("renders SlotSummary for single-day slots", () => {
    render(<BookingConfirmationPanel {...baseProps} selectedSlot={singleDaySlot} />);

    expect(screen.queryByText("3d")).not.toBeInTheDocument();
    expect(screen.getByText("05:00 - 06:00")).toBeInTheDocument();
  });

  it("confirmation button works for both types", () => {
    const onConfirm = vi.fn();
    render(<BookingConfirmationPanel {...baseProps} selectedSlot={multiDaySlot} onConfirm={onConfirm} />);

    fireEvent.click(screen.getByText("Confirmar agendamento"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
