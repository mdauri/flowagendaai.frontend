import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DateTime } from "luxon";
import { SummaryCard } from "@/components/public-booking/customer-data-form";

const sampleService = {
  id: "service-1",
  name: "Consultoria Individual",
  description: "Detalhes do servico",
  durationInMinutes: 60,
  imageUrl: null,
  thumbnailUrl: null,
};

describe("CustomerDataForm SummaryCard", () => {
  it("renders SummaryCard when slot is single-day", () => {
    render(
      <SummaryCard
        service={sampleService}
        date={DateTime.fromISO("2026-04-18")}
        slotStart="2026-04-18T08:00:00.000Z"
        slotEnd="2026-04-18T09:00:00.000Z"
        professionalName="Ana Silva"
        timezone="America/Sao_Paulo"
        customerPhone="+55 (11) 98765-4321"
      />,
    );

    expect(screen.getByText("Consultoria Individual")).toBeInTheDocument();
    expect(screen.queryByText("3d")).not.toBeInTheDocument();
    // Time is rendered in a span with en-dash to next span, use container query
    const card = screen.getByText("Consultoria Individual").closest("div");
    expect(card?.textContent).toContain("05:00");
  });

  it("renders MultiDayBookingSummary when slot is multi-day", () => {
    const multiDayService = {
      ...sampleService,
      name: "Imersao de Lideranca",
      durationInMinutes: 2400,
    };

    render(
      <SummaryCard
        service={multiDayService}
        date={DateTime.fromISO("2026-04-18")}
        slotStart="2026-04-18T15:00:00.000Z"
        slotEnd="2026-04-22T15:00:00.000Z"
        professionalName="Ana Silva"
        timezone="America/Sao_Paulo"
        customerPhone="+55 (11) 98765-4321"
        daysAffected={[
          { date: "2026-04-18", start: "2026-04-18T15:00:00.000Z", end: "2026-04-18T18:00:00.000Z", durationMinutes: 180 },
          { date: "2026-04-21", start: "2026-04-21T08:00:00.000Z", end: "2026-04-21T18:00:00.000Z", durationMinutes: 600 },
          { date: "2026-04-22", start: "2026-04-22T08:00:00.000Z", end: "2026-04-22T15:00:00.000Z", durationMinutes: 420 },
        ]}
      />,
    );

    expect(screen.getByText("Imersao de Lideranca")).toBeInTheDocument();
    expect(screen.getByText("3d")).toBeInTheDocument();
    expect(screen.getByText(/Dias afetados/)).toBeInTheDocument();
  });
});
