import { screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { ProductOrdersPage } from "@/pages/product-orders-page";
import { renderWithProviders } from "@/test/render";

vi.mock("@/hooks/use-order-module", () => ({
  useProductOrdersQuery: () => ({
    isLoading: false,
    isError: false,
    error: null,
    data: {
      orders: [
        {
          id: "order-1",
          orderNumber: "#001",
          customerName: "Maria",
          customerPhone: "5511999999999",
          desiredDate: "2026-06-30",
          fulfillmentType: "PICKUP",
          address: null,
          notes: null,
          status: "RECEIVED",
          paymentStatus: "PENDING",
          totalAmount: 120,
        },
      ],
    },
    refetch: vi.fn(),
  }),
  useProductOrderQuery: () => ({
    data: null,
    error: null,
  }),
  useRegisterProductOrderManualPaymentMutation: () => ({
    isPending: false,
    error: null,
    mutateAsync: vi.fn(),
  }),
  useUpdateProductOrderStatusMutation: () => ({
    isPending: false,
    error: null,
    mutateAsync: vi.fn(),
  }),
}));

describe("ProductOrdersPage", () => {
  test("exibe as datas dos pedidos em formato brasileiro", () => {
    renderWithProviders(<ProductOrdersPage />);

    expect(screen.getByText("Maria • 30/06/2026")).toBeInTheDocument();
  });
});
