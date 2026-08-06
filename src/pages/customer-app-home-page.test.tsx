import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { renderWithProviders } from "@/test/render";
import { CustomerAppHomePage } from "./customer-app-home-page";

const mockConfigQuery = vi.fn();
const mockBookingsQuery = vi.fn();
const mockGetCustomerAppSession = vi.fn();
const mockIsStandalonePwa = vi.fn();

vi.mock("@/hooks/use-public-customer-app-config-query", () => ({
  usePublicCustomerAppConfigQuery: () => mockConfigQuery(),
}));
vi.mock("@/hooks/use-customer-app-bookings-query", () => ({
  useCustomerAppBookingsQuery: () => mockBookingsQuery(),
}));
vi.mock("@/hooks/use-is-standalone-pwa", () => ({
  useIsStandalonePwa: () => mockIsStandalonePwa(),
}));
vi.mock("@/session/customer-app-session-storage", () => ({
  getCustomerAppSession: (...args: unknown[]) => mockGetCustomerAppSession(...args),
  setCustomerAppSession: vi.fn(),
  clearCustomerAppSession: vi.fn(),
}));

describe("CustomerAppHomePage", () => {
  beforeEach(() => {
    mockIsStandalonePwa.mockReturnValue(false);
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
      isError: false,
      isSuccess: false,
      data: undefined,
      error: null,
    });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, "Notification", {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(window, "PushManager", {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(window.navigator, "serviceWorker", {
      configurable: true,
      value: undefined,
    });
  });

  function renderPage() {
    renderWithProviders(
      <MemoryRouter initialEntries={["/c/test-studio"]}>
        <Routes>
          <Route path="/c/:slug" element={<CustomerAppHomePage />} />
        </Routes>
      </MemoryRouter>,
    );
  }

  it("renders State A with conversion and installation in the browser", () => {
    renderPage();

    expect(screen.getByText("App do cliente")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Test Studio" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Agende aqui" })).toHaveAttribute(
      "href",
      "/c/test-studio/catalog",
    );
    expect(screen.getByRole("link", { name: "Meus compromissos" })).toHaveAttribute(
      "href",
      "/c/test-studio",
    );
    expect(screen.queryByText("Instalar neste aparelho")).not.toBeInTheDocument();
    expect(screen.getAllByText("Lembretes").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "Meus compromissos" })).toBeInTheDocument();
  });

  it("renders State B with the next appointment first in standalone mode", () => {
    mockIsStandalonePwa.mockReturnValue(true);
    mockGetCustomerAppSession.mockReturnValue({
      token: "session-token-1",
      expiresAt: "2026-10-20T10:00:00.000Z",
    });
    mockBookingsQuery.mockReturnValue({
      isLoading: false,
      isError: false,
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

    renderPage();

    expect(
      screen.getByRole("heading", { name: "Próximo compromisso" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver detalhes" })).toHaveAttribute(
      "href",
      "/c/test-studio/bookings/booking-1",
    );
    expect(screen.getByRole("link", { name: "Agendar novo horário" })).toHaveAttribute(
      "href",
      "/c/test-studio/catalog",
    );
    expect(screen.getAllByText("Corte")).toHaveLength(2);
    expect(screen.queryByText("Instalar neste aparelho")).not.toBeInTheDocument();
    expect(screen.queryByText("App do cliente")).not.toBeInTheDocument();
  });

  it("renders State C when a standalone session has no future appointments", () => {
    mockIsStandalonePwa.mockReturnValue(true);
    mockGetCustomerAppSession.mockReturnValue({
      token: "session-token-1",
      expiresAt: "2026-10-20T10:00:00.000Z",
    });
    mockBookingsQuery.mockReturnValue({
      isLoading: false,
      isError: false,
      isSuccess: true,
      data: {
        customer: { id: "customer-1", name: "Jessica" },
        bookings: [],
      },
      error: null,
    });

    renderPage();

    expect(
      screen.getByRole("heading", {
        name: "Você ainda não tem compromissos agendados.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Agendar horário" })).toHaveAttribute(
      "href",
      "/c/test-studio/catalog",
    );
    expect(screen.getByText("Nenhum compromisso futuro.")).toBeInTheDocument();
    expect(screen.queryByText("Instalar neste aparelho")).not.toBeInTheDocument();
  });

  it("does not claim an empty schedule when standalone has no session", () => {
    mockIsStandalonePwa.mockReturnValue(true);

    renderPage();

    expect(
      screen.getByRole("heading", { name: "Seus compromissos neste aparelho" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Você ainda não tem compromissos agendados."),
    ).not.toBeInTheDocument();
  });

  it("renders State D without an activation action when push is denied", async () => {
    Object.defineProperty(globalThis, "Notification", {
      configurable: true,
      value: { permission: "denied" },
    });
    Object.defineProperty(window, "PushManager", {
      configurable: true,
      value: function PushManager() {},
    });
    Object.defineProperty(window.navigator, "serviceWorker", {
      configurable: true,
      value: {},
    });

    renderPage();

    expect(await screen.findByText(/Os lembretes estão bloqueados/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Ativar lembretes/ })).not.toBeInTheDocument();
  });

  it("renders State E when push is unsupported", () => {
    renderPage();

    expect(
      screen.getByText(/Este navegador não suporta lembretes push/),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Ativar lembretes/ })).not.toBeInTheDocument();
  });

  it("does not request notification permission on mount", async () => {
    const requestPermission = vi.fn();
    mockGetCustomerAppSession.mockReturnValue({
      token: "session-token-1",
      expiresAt: "2026-10-20T10:00:00.000Z",
    });
    Object.defineProperty(globalThis, "Notification", {
      configurable: true,
      value: {
        permission: "default",
        requestPermission,
      },
    });
    Object.defineProperty(window, "PushManager", {
      configurable: true,
      value: function PushManager() {},
    });
    Object.defineProperty(window.navigator, "serviceWorker", {
      configurable: true,
      value: {
        ready: Promise.resolve({
          pushManager: {
            getSubscription: vi.fn().mockResolvedValue(null),
          },
        }),
      },
    });

    renderPage();

    expect(await screen.findByRole("button", { name: "Ativar lembretes" })).toBeInTheDocument();
    expect(requestPermission).not.toHaveBeenCalled();
  });
});
