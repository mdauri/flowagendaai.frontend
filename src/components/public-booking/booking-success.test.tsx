import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BookingSuccess } from "@/components/public-booking/booking-success";

const singleDayBooking = {
  id: "booking-1",
  professionalId: "prof-1",
  serviceId: "svc-1",
  start: "2026-04-18T08:00:00.000Z",
  end: "2026-04-18T09:00:00.000Z",
  customerName: "Roberto",
  customerPhone: "+55 (11) 98765-4321",
  customerEmail: null,
  professionalName: "Ana Silva",
  serviceName: "Consultoria",
};

const multiDayBooking = {
  ...singleDayBooking,
  id: "booking-2",
  serviceName: "Imersao de Lideranca",
  start: "2026-04-18T15:00:00.000Z",
  end: "2026-04-22T15:00:00.000Z",
  daysAffected: [
    { date: "2026-04-18", start: "2026-04-18T15:00:00.000Z", end: "2026-04-18T18:00:00.000Z", durationMinutes: 180 },
    { date: "2026-04-21", start: "2026-04-21T08:00:00.000Z", end: "2026-04-21T18:00:00.000Z", durationMinutes: 600 },
    { date: "2026-04-22", start: "2026-04-22T08:00:00.000Z", end: "2026-04-22T15:00:00.000Z", durationMinutes: 420 },
  ],
};

describe("BookingSuccess", () => {
  const baseProps = {
    timezone: "America/Sao_Paulo",
    shareUrl: "https://example.com/booking",
    onNewBooking: vi.fn(),
  };

  it("shows MultiDayBadge and affected days for multi-day booking", () => {
    render(<BookingSuccess {...baseProps} booking={multiDayBooking} />);

    expect(screen.getByText("Multi-dia: 3 dias")).toBeInTheDocument();
    expect(screen.getByText(/Dias afetados/)).toBeInTheDocument();
  });

  it("does not show extra section for single-day booking", () => {
    render(<BookingSuccess {...baseProps} booking={singleDayBooking} />);

    expect(screen.queryByText(/Multi-dia/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Dias afetados/)).not.toBeInTheDocument();
  });

  it("Add to calendar button present for both types", () => {
    const { rerender } = render(<BookingSuccess {...baseProps} booking={singleDayBooking} />);
    expect(screen.getByText(/Adicionar ao calend[aá]rio/)).toBeInTheDocument();

    rerender(<BookingSuccess {...baseProps} booking={multiDayBooking} />);
    expect(screen.getByText(/Adicionar ao calend[aá]rio/)).toBeInTheDocument();
  });

  it("Success message renders correctly", () => {
    render(<BookingSuccess {...baseProps} booking={multiDayBooking} />);

    expect(screen.getByText("Agendamento confirmado!")).toBeInTheDocument();
  });
});
