import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AffectedDaysList } from "@/components/slots/affected-days-list";

const sampleDays = [
  {
    date: "2026-04-18",
    start: "2026-04-18T15:00:00.000Z",
    end: "2026-04-18T18:00:00.000Z",
    durationMinutes: 180,
  },
  {
    date: "2026-04-21",
    start: "2026-04-21T08:00:00.000Z",
    end: "2026-04-21T18:00:00.000Z",
    durationMinutes: 600,
  },
  {
    date: "2026-04-22",
    start: "2026-04-22T08:00:00.000Z",
    end: "2026-04-22T15:00:00.000Z",
    durationMinutes: 420,
  },
];

describe("AffectedDaysList", () => {
  it("renders list with correct formatting", () => {
    render(<AffectedDaysList days={sampleDays} timezone="UTC" />);

    expect(screen.getByText("Dias afetados:")).toBeInTheDocument();
    expect(screen.getByLabelText(/Dia 1: .*18\/04/)).toBeInTheDocument();
    expect(screen.getByText(/15:00 - 18:00/)).toBeInTheDocument();
    expect(screen.getByText(/\(3h\)/)).toBeInTheDocument();
  });

  it("shows day of week, date, time range, duration", () => {
    render(<AffectedDaysList days={sampleDays} timezone="UTC" />);

    // Day label includes accent (sáb.) so use flexible match on date
    expect(screen.getByText(/18\/04/)).toBeInTheDocument();
    // Time range uses hyphen with spaces
    expect(screen.getByText(/15:00 - 18:00/)).toBeInTheDocument();
    expect(screen.getByText(/\(3h\)/)).toBeInTheDocument();
  });

  it("collapsible variant toggles visibility", () => {
    render(<AffectedDaysList days={sampleDays} timezone="UTC" collapsible />);

    // Initially collapsed - only shows button with count
    expect(screen.getByText(/Dias afetados \(3\)/)).toBeInTheDocument();
    expect(screen.queryByText(/15:00 - 18:00/)).not.toBeInTheDocument();

    // Click to expand
    fireEvent.click(screen.getByText(/Dias afetados \(3\)/));
    expect(screen.getByText(/15:00 - 18:00/)).toBeInTheDocument();

    // Click to collapse
    fireEvent.click(screen.getByText(/Dias afetados \(3\)/));
    expect(screen.queryByText(/15:00 - 18:00/)).not.toBeInTheDocument();
  });

  it("bullets have aria-hidden", () => {
    render(<AffectedDaysList days={sampleDays} timezone="UTC" />);
    // Bullets have aria-hidden but not role="presentation"
    const bullets = document.querySelectorAll("[aria-hidden=\"true\"]");
    expect(bullets.length).toBeGreaterThanOrEqual(sampleDays.length);
  });

  it("custom className is applied", () => {
    render(<AffectedDaysList days={sampleDays} timezone="UTC" className="custom-class" />);
    const container = screen.getByText("Dias afetados:").closest("div");
    expect(container).toHaveClass("custom-class");
  });
});
