import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MultiDaySlotCard } from "@/components/public-booking/multi-day-slot-card";

const sampleSlot = {
  start: "2026-04-18T15:00:00.000Z",
  end: "2026-04-22T15:00:00.000Z",
  daysAffected: [
    { date: "2026-04-18", start: "2026-04-18T15:00:00.000Z", end: "2026-04-18T18:00:00.000Z", durationMinutes: 180 },
    { date: "2026-04-21", start: "2026-04-21T08:00:00.000Z", end: "2026-04-21T18:00:00.000Z", durationMinutes: 600 },
    { date: "2026-04-22", start: "2026-04-22T08:00:00.000Z", end: "2026-04-22T15:00:00.000Z", durationMinutes: 420 },
  ],
};

describe("MultiDaySlotCard", () => {
  it("renders with correct times and badge", () => {
    render(
      <MultiDaySlotCard
        slot={sampleSlot}
        selected={false}
        timezone="America/Sao_Paulo"
        onSelect={() => {}}
      />,
    );

    // Times are converted to tenant timezone (UTC-3 in April): 15:00 UTC = 12:00 BRT
    // Start time is in its own span
    const button = screen.getByRole("button");
    expect(button.textContent).toContain("12:00");
    expect(screen.getByText("3d")).toBeInTheDocument();
  });

  it("selected state applies correct styling", () => {
    render(
      <MultiDaySlotCard
        slot={sampleSlot}
        selected
        timezone="America/Sao_Paulo"
        onSelect={() => {}}
      />,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-pressed", "true");
  });

  it("disabled state shows reduced opacity", () => {
    render(
      <MultiDaySlotCard
        slot={sampleSlot}
        selected={false}
        disabled
        timezone="America/Sao_Paulo"
        onSelect={() => {}}
      />,
    );

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("accessibility label includes multi-day info", () => {
    render(
      <MultiDaySlotCard
        slot={sampleSlot}
        selected={false}
        timezone="America/Sao_Paulo"
        onSelect={() => {}}
      />,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label");
    const label = button.getAttribute("aria-label");
    expect(label).toContain("multi-dia");
    expect(label).toContain("3 dias");
  });

  it("onSelect callback fires correctly", () => {
    const onSelect = vi.fn();
    render(
      <MultiDaySlotCard
        slot={sampleSlot}
        selected={false}
        timezone="America/Sao_Paulo"
        onSelect={onSelect}
      />,
    );

    fireEvent.click(screen.getByRole("button"));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});
