import { describe, expect, it, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { renderWithProviders } from "@/test/render";
import { CustomerAppHomePage } from "./customer-app-home-page";

const mockConfigQuery = vi.fn();
const mockBookingsQuery = vi.fn();
const mockGetCustomerAppSession = vi.fn();

vi.mock("@/hooks/use-public-customer-app-config-query", () => ({
  usePublicCustomerAppConfigQuery: () => mockConfigQuery(),
}));
vi.mock("@/hooks/use-customer-app-bookings-query", () => ({
  useCustomerAppBookingsQuery: () => mockBookingsQuery(),
}));
vi.mock("@/session/customer-app-session-storage", () => ({
  getCustomerAppSession: (...args: unknown[]) => mockGetCustomerAppSession(...args),
  setCustomerAppSession: vi.fn(),
  clearCustomerAppSession: vi.fn(),
}));

describe("CustomerAppHomePage", () => {
  beforeEach(() => {
    mockGetCustomerAppSession.mockReturnValue(null);
    mockConfigQuery.mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        tenant: {
          id: "tenant-1",
          name: "Test Studio",
          slug: "test-studio",
          timezone: "America/Sao_Paulo",
          logoUrl: null,
          coverImageUrl: null,
          publicAddress: null,
          description: "Descricao do estabelecimento",
        },
        customerAppUrl: "http://localhost:5173/c/test-studio",
        catalogUrl: "http://localhost:5173/c/test-studio/catalog",
        whatsappPhone: "5511999999999",
        whatsappUrl: "https://wa.me/5511999999999",
        supportsInstallHint: true,
        supportsPushHint: true,
        pushPublicKey: "BElxDemoPushKey",
      },
    });
    mockBookingsQuery.mockReturnValue({
      isLoading: false,
      isSuccess: false,
      data: undefined,
      error: null,
    });
  });

  it("renders the customer app shell and primary actions", () => {
    renderWithProviders(
      <MemoryRouter initialEntries={["/c/test-studio"]}>
        <Routes>
          <Route path="/c/:slug" element={<CustomerAppHomePage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("App do cliente")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Test Studio" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Agendar agora" })).toHaveAttribute(
      "href",
      "/c/test-studio/catalog",
    );
    expect(screen.getByText("Instalar neste aparelho")).toBeInTheDocument();
    expect(screen.getByText("Lembretes push")).toBeInTheDocument();
    expect(screen.getByText(/Meus compromissos/)).toBeInTheDocument();
  });

  it("renders customer bookings when a session is stored", () => {
    mockGetCustomerAppSession.mockReturnValue({
        token: "session-token-1",
        expiresAt: "2026-10-20T10:00:00.000Z",
      });
    mockBookingsQuery.mockReturnValue({
      isLoading: false,
      isSuccess: true,
      data: {
        customer: {
          id: "customer-1",
          name: "Jessica",
        },
        bookings: [
          {
            id: "booking-1",
            status: "CONFIRMED",
            start: "2026-08-01T13:00:00.000Z",
            end: "2026-08-01T14:00:00.000Z",
            customerName: "Jessica",
            customerPhone: "+5511999999999",
            customerEmail: "jessica@example.com",
            professionalName: "Ana",
            serviceName: "Corte",
            manageTokenExpiresAt: "2026-08-31T13:00:00.000Z",
          },
        ],
      },
      error: null,
    });

    renderWithProviders(
      <MemoryRouter initialEntries={["/c/test-studio"]}>
        <Routes>
          <Route path="/c/:slug" element={<CustomerAppHomePage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Corte")).toBeInTheDocument();
    expect(screen.getByText("Ana")).toBeInTheDocument();
  });
});
