import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MultiDayConflictError } from "@/components/public-booking/multi-day-conflict-error";

describe("MultiDayConflictError", () => {
  const baseProps = {
    conflictDay: "2026-04-21",
    conflictStart: "2026-04-21T08:00:00.000Z",
    conflictEnd: "2026-04-21T18:00:00.000Z",
    timezone: "UTC",
    onRetry: vi.fn(),
  };

  it("renders error message with correct day and times", () => {
    render(<MultiDayConflictError {...baseProps} />);

    expect(screen.getByText("Horario indisponivel")).toBeInTheDocument();
    expect(screen.getByText(/21\/04.*nao esta disponivel/)).toBeInTheDocument();
    // Description text is in the feedback banner's paragraph
    const alert = screen.getAllByRole("alert")[0]!;
    expect(alert.textContent).toContain("08:00");
    expect(alert.textContent).toContain("18:00");
  });

  it("shows existing booking name when provided", () => {
    render(
      <MultiDayConflictError
        {...baseProps}
        existingBookingName="Consultoria XYZ"
      />,
    );

    expect(screen.getByText(/booking existente "Consultoria XYZ"/)).toBeInTheDocument();
  });

  it("onRetry fires when button clicked", () => {
    const onRetry = vi.fn();
    render(<MultiDayConflictError {...baseProps} onRetry={onRetry} />);

    fireEvent.click(screen.getByText("Atualizar horarios"));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("accessibility attributes are correct", () => {
    render(<MultiDayConflictError {...baseProps} />);

    // Component has nested alert roles, so we query for the outer container
    const alerts = screen.getAllByRole("alert");
    expect(alerts.length).toBeGreaterThanOrEqual(1);
    // Outer container should have aria-live="assertive"
    const outerAlert = alerts.find(el => el.getAttribute("aria-live") === "assertive");
    expect(outerAlert).toBeDefined();
  });
});
