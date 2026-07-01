import { screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { ProductionPage } from "@/pages/production-page";
import { renderWithProviders } from "@/test/render";

vi.mock("@/hooks/use-order-module", () => ({
  useProductionSummaryQuery: () => ({
    isLoading: false,
    isError: false,
    error: null,
    data: {
      date: "2026-06-30",
      items: [
        {
          productName: "Coxinha",
          quantity: 12,
          unitType: "UNIT",
        },
      ],
    },
    refetch: vi.fn(),
  }),
}));

describe("ProductionPage", () => {
  test("exibe a data selecionada em formato brasileiro", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-29T12:00:00Z"));

    try {
      renderWithProviders(<ProductionPage />);

      expect(screen.getByText("Data selecionada: 30/06/2026")).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});
