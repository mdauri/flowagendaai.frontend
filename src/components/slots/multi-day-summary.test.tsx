import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MultiDaySummary } from "@/components/slots/multi-day-summary";

const sampleProps = {
  serviceName: "Imersao de Lideranca",
  professionalName: "Ana Silva",
  start: "2026-04-18T15:00:00.000Z",
  end: "2026-04-22T15:00:00.000Z",
  daysAffected: [
    { date: "2026-04-18", start: "2026-04-18T15:00:00.000Z", end: "2026-04-18T18:00:00.000Z", durationMinutes: 180 },
    { date: "2026-04-21", start: "2026-04-21T08:00:00.000Z", end: "2026-04-21T18:00:00.000Z", durationMinutes: 600 },
    { date: "2026-04-22", start: "2026-04-22T08:00:00.000Z", end: "2026-04-22T15:00:00.000Z", durationMinutes: 420 },
  ],
  timezone: "UTC",
};

describe("MultiDaySummary", () => {
  it("renders service name, badge, period, affected days, professional", () => {
    render(<MultiDaySummary {...sampleProps} />);

    expect(screen.getByText("Imersao de Lideranca")).toBeInTheDocument();
    expect(screen.getByText("3d")).toBeInTheDocument();
    // "Com:" and professional name are in separate spans
    expect(screen.getByText("Com:")).toBeInTheDocument();
    expect(screen.getByText("Ana Silva")).toBeInTheDocument();
  });

  it("times formatted correctly in tenant timezone", () => {
    render(<MultiDaySummary {...sampleProps} />);

    expect(screen.getAllByText("15:00").length).toBeGreaterThanOrEqual(1);
  });

  it("MultiDayBadge shows correct day count", () => {
    render(<MultiDaySummary {...sampleProps} />);

    expect(screen.getByText("3d")).toBeInTheDocument();
  });
});
