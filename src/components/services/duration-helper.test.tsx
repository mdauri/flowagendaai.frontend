import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DurationHelper } from "@/components/services/duration-helper";

describe("DurationHelper", () => {
  it("shows estimated days for 1440 min (2.4 days at 10h/day => ceil 3)", () => {
    render(<DurationHelper durationInMinutes={1440} />);
    // Text is split by React, need to check the paragraph's textContent
    const paragraph = document.querySelector("[role='note'] p");
    expect(paragraph?.textContent).toContain("estima 3 dias");
  });

  it("shows estimated days for 2400 min (4 days at 10h/day)", () => {
    render(<DurationHelper durationInMinutes={2400} />);
    const paragraph = document.querySelector("[role='note'] p");
    expect(paragraph?.textContent).toContain("estima 4 dias");
  });

  it("does not show for 60 min", () => {
    render(<DurationHelper durationInMinutes={60} />);
    expect(screen.queryByText(/Servico multi-dia/)).not.toBeInTheDocument();
  });

  it("does not show for 960 min (exactly MAX_SERVICE_DURATION)", () => {
    render(<DurationHelper durationInMinutes={960} />);
    expect(screen.queryByText(/Servico multi-dia/)).not.toBeInTheDocument();
  });

  it("shows for 961 min (just above MAX_SERVICE_DURATION)", () => {
    render(<DurationHelper durationInMinutes={961} />);
    expect(screen.getByText(/Servico multi-dia/)).toBeInTheDocument();
  });

  it("custom averageWorkingHoursPerDay changes estimate", () => {
    render(<DurationHelper durationInMinutes={1440} averageWorkingHoursPerDay={8} />);
    // 1440 / (8 * 60) = 3 days
    expect(screen.getByText(/Servico multi-dia: estima 3 dias.*expediente medio 8h\/dia/)).toBeInTheDocument();
  });

  it("renders info icon with aria-hidden", () => {
    render(<DurationHelper durationInMinutes={1440} />);
    const icon = screen.getByText("\u24D8");
    expect(icon).toHaveAttribute("aria-hidden", "true");
  });

  it("applies custom className", () => {
    render(<DurationHelper durationInMinutes={1440} className="custom-class" />);
    const container = screen.getByRole("note");
    expect(container).toHaveClass("custom-class");
  });
});
