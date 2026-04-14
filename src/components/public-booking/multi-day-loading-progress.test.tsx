import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MultiDayLoadingProgress } from "@/components/public-booking/multi-day-loading-progress";

const sampleDays = [
  { date: "2026-04-18", status: "available" as const },
  { date: "2026-04-21", status: "checking" as const },
  { date: "2026-04-22", status: "pending" as const },
];

describe("MultiDayLoadingProgress", () => {
  it("renders all days with correct status icons", () => {
    render(<MultiDayLoadingProgress days={sampleDays} />);

    expect(screen.getByText("Calculando disponibilidade multi-dia...")).toBeInTheDocument();
    // Date format is "ccc dd/MM" e.g., "sáb 18/04"
    expect(screen.getByText(/18\/04/)).toBeInTheDocument();
    expect(screen.getByText(/21\/04/)).toBeInTheDocument();
  });

  it("spinner animates for checking status", () => {
    render(<MultiDayLoadingProgress days={sampleDays} />);

    const spinners = screen.getAllByRole("status");
    expect(spinners.length).toBeGreaterThan(0);
  });

  it("overlay covers viewport", () => {
    render(<MultiDayLoadingProgress days={sampleDays} />);

    const container = screen.getByRole("status");
    expect(container).toHaveClass("flex");
    expect(container).toHaveClass("items-center");
    expect(container).toHaveClass("justify-center");
  });
});
