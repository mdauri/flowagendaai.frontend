import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SlotGrid } from "@/components/public-booking/slots";

const singleDaySlots = [
  { start: "2026-04-18T08:00:00.000Z", end: "2026-04-18T09:00:00.000Z" },
  { start: "2026-04-18T09:00:00.000Z", end: "2026-04-18T10:00:00.000Z" },
];

const multiDaySlots = [
  {
    start: "2026-04-18T15:00:00.000Z",
    end: "2026-04-22T15:00:00.000Z",
    daysAffected: [
      { date: "2026-04-18", start: "2026-04-18T15:00:00.000Z", end: "2026-04-18T18:00:00.000Z", durationMinutes: 180 },
      { date: "2026-04-21", start: "2026-04-21T08:00:00.000Z", end: "2026-04-21T18:00:00.000Z", durationMinutes: 600 },
      { date: "2026-04-22", start: "2026-04-22T08:00:00.000Z", end: "2026-04-22T15:00:00.000Z", durationMinutes: 420 },
    ],
  },
];

const mixedSlots = [
  { start: "2026-04-18T08:00:00.000Z", end: "2026-04-18T09:00:00.000Z" },
  {
    start: "2026-04-18T15:00:00.000Z",
    end: "2026-04-22T15:00:00.000Z",
    daysAffected: [
      { date: "2026-04-18", start: "2026-04-18T15:00:00.000Z", end: "2026-04-18T18:00:00.000Z", durationMinutes: 180 },
      { date: "2026-04-21", start: "2026-04-21T08:00:00.000Z", end: "2026-04-21T18:00:00.000Z", durationMinutes: 600 },
    ],
  },
];

describe("SlotGrid", () => {
  it("renders SlotCard for single-day slots", () => {
    render(
      <SlotGrid
        slots={singleDaySlots}
        selectedSlotStart={null}
        timezone="UTC"
        onSelect={() => {}}
        isLoading={false}
      />,
    );

    // Time is rendered with en-dash but split across spans; use container textContent
    const grid = document.querySelector("[class*='grid-cols-2']");
    expect(grid?.textContent).toContain("08:00");
    expect(grid?.textContent).toContain("09:00");
    expect(screen.queryByText("3d")).not.toBeInTheDocument();
  });

  it("renders MultiDaySlotCard for multi-day slots", () => {
    render(
      <SlotGrid
        slots={multiDaySlots}
        selectedSlotStart={null}
        timezone="UTC"
        onSelect={() => {}}
        isLoading={false}
      />,
    );

    expect(screen.getByText("3d")).toBeInTheDocument();
    // Multi-day slot card shows just the start time in a span
    const button = screen.getByRole("button");
    expect(button.textContent).toContain("15:00");
  });

  it("mixed grid renders both types correctly", () => {
    render(
      <SlotGrid
        slots={mixedSlots}
        selectedSlotStart={null}
        timezone="UTC"
        onSelect={() => {}}
        isLoading={false}
      />,
    );

    // Use container textContent for single-day slot (text split across spans)
    const grid = document.querySelector("[class*='grid-cols-2']");
    expect(grid?.textContent).toContain("08:00");
    // Multi-day slot badge
    expect(screen.getByText("2d")).toBeInTheDocument();
  });

  it("loading skeleton still works", () => {
    render(
      <SlotGrid
        slots={[]}
        selectedSlotStart={null}
        timezone="UTC"
        onSelect={() => {}}
        isLoading
      />,
    );

    // Loading skeletons are divs with animate-pulse class, not buttons
    const loadingDivs = document.querySelectorAll(".animate-pulse");
    expect(loadingDivs.length).toBe(4);
    // No buttons should exist when loading
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("empty state still works", () => {
    render(
      <SlotGrid
        slots={[]}
        selectedSlotStart={null}
        timezone="America/Sao_Paulo"
        onSelect={() => {}}
        isLoading={false}
      />,
    );

    expect(screen.getByText("Sem horários disponíveis")).toBeInTheDocument();
  });
});
