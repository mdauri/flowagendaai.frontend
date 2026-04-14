import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MultiDayBadge } from "@/components/slots/multi-day-badge";

describe("MultiDayBadge", () => {
  it("renders with correct text for daysCount 2", () => {
    render(<MultiDayBadge daysCount={2} />);
    expect(screen.getByText("Multi-dia: 2 dias")).toBeInTheDocument();
  });

  it("renders with correct text for daysCount 3", () => {
    render(<MultiDayBadge daysCount={3} />);
    expect(screen.getByText("Multi-dia: 3 dias")).toBeInTheDocument();
  });

  it("renders with correct text for daysCount 5", () => {
    render(<MultiDayBadge daysCount={5} />);
    expect(screen.getByText("Multi-dia: 5 dias")).toBeInTheDocument();
  });

  it("compact variant renders icon and number only", () => {
    render(<MultiDayBadge daysCount={3} variant="compact" />);
    expect(screen.getByText("3d")).toBeInTheDocument();
  });

  it("full variant renders full text", () => {
    render(<MultiDayBadge daysCount={2} variant="full" />);
    expect(screen.getByText("Multi-dia: 2 dias")).toBeInTheDocument();
  });

  it("custom className is applied", () => {
    render(<MultiDayBadge daysCount={2} className="custom-class" />);
    // Component uses aria-label, not role="status"
    const badge = screen.getByLabelText(/servico multi-dia.*2 dias/i);
    expect(badge).toHaveClass("custom-class");
  });

  it("screen reader announces correct label", () => {
    render(<MultiDayBadge daysCount={3} />);
    const badge = screen.getByLabelText(/servico multi-dia.*3 dias/i);
    expect(badge).toBeInTheDocument();
  });

  it("calendar icon has aria-hidden", () => {
    render(<MultiDayBadge daysCount={2} />);
    const icon = screen.getByText("\u{1F4C5}");
    expect(icon).toHaveAttribute("aria-hidden", "true");
  });
});
