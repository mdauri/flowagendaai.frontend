import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MultiDayBookingSummary } from "@/components/public-booking/multi-day-booking-summary";

const sampleProps = {
  service: {
    id: "service-1",
    name: "Imersao de Lideranca",
    description: "Programa intensivo",
    durationInMinutes: 2400,
    imageUrl: null,
    thumbnailUrl: null,
  },
  start: "2026-04-18T15:00:00.000Z",
  end: "2026-04-22T15:00:00.000Z",
  daysAffected: [
    { date: "2026-04-18", start: "2026-04-18T15:00:00.000Z", end: "2026-04-18T18:00:00.000Z", durationMinutes: 180 },
    { date: "2026-04-21", start: "2026-04-21T08:00:00.000Z", end: "2026-04-21T18:00:00.000Z", durationMinutes: 600 },
    { date: "2026-04-22", start: "2026-04-22T08:00:00.000Z", end: "2026-04-22T15:00:00.000Z", durationMinutes: 420 },
  ],
  professionalName: "Ana Silva",
  timezone: "America/Sao_Paulo",
  customerPhone: "+55 (11) 98765-4321",
};

describe("MultiDayBookingSummary", () => {
  it("renders all fields correctly", () => {
    render(<MultiDayBookingSummary {...sampleProps} />);

    expect(screen.getByText("Imersao de Lideranca")).toBeInTheDocument();
    expect(screen.getByText("3d")).toBeInTheDocument();
    expect(screen.getByText(/Ana Silva/)).toBeInTheDocument();
    expect(screen.getByText(/\+55 \(11\) 98765-4321/)).toBeInTheDocument();
  });

  it("MultiDayBadge shows correct count", () => {
    render(<MultiDayBookingSummary {...sampleProps} />);

    expect(screen.getByText("3d")).toBeInTheDocument();
  });

  it("AffectedDaysList renders with proper formatting", () => {
    render(<MultiDayBookingSummary {...sampleProps} />);

    expect(screen.getByText(/Dias afetados/)).toBeInTheDocument();
  });
});
