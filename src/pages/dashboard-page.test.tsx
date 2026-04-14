import { screen, waitFor } from "@testing-library/react";
import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { DateTime } from "luxon";
import { DashboardPage } from "@/pages/dashboard-page";
import { renderWithProviders } from "@/test/render";
import { dashboardService } from "@/services/dashboard-service";
import { useProfessionalsQuery } from "@/hooks/use-professionals-query";
import { useServicesQuery } from "@/hooks/use-services-query";
import { ApiError } from "@/types/api";

vi.mock("@/services/dashboard-service", () => ({
  dashboardService: {
    getSummary: vi.fn(),
  },
}));
vi.mock("@/hooks/use-professionals-query", () => ({
  useProfessionalsQuery: vi.fn(),
}));
vi.mock("@/hooks/use-services-query", () => ({
  useServicesQuery: vi.fn(),
}));

const mockedDashboardService = vi.mocked(dashboardService);
const mockedUseProfessionalsQuery = vi.mocked(useProfessionalsQuery);
const mockedUseServicesQuery = vi.mocked(useServicesQuery);

const successResponse = {
  date: "2026-03-30",
  tenantTimezone: "America/Sao_Paulo",
  generatedAt: "2026-03-30T13:00:00.000Z",
  totals: {
    totalBookings: 8,
    confirmed: 5,
    pending: 2,
    cancelled: 1,
    completed: 0,
  },
  occupancy: {
    availableMinutes: 480,
    bookedMinutes: 300,
    percentage: 62.5,
  },
  todayBookings: [
    {
      bookingId: "booking-1",
      start: "2026-03-30T12:00:00.000Z",
      end: "2026-03-30T13:00:00.000Z",
      status: "CONFIRMED",
      customerName: null,
      professionalId: "professional-1",
      professionalName: "Ana",
      serviceId: "service-1",
      serviceName: "Consulta",
    },
  ],
  upcomingBookings: [
    {
      bookingId: "booking-2",
      start: "2026-03-30T14:00:00.000Z",
      end: "2026-03-30T15:00:00.000Z",
      status: "PENDING",
      customerName: "Bruno",
      professionalId: "professional-2",
      professionalName: "Carlos",
      serviceId: "service-2",
      serviceName: "Retorno",
    },
  ],
  professionalOccupancy: [
    {
      professionalId: "professional-1",
      professionalName: "Ana",
      availableMinutes: 240,
      bookedMinutes: 180,
      percentage: 75,
      totalBookings: 3,
    },
  ],
};

function createDeferredPromise<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.spyOn(DateTime, "local").mockReturnValue(
      DateTime.fromISO("2026-03-30T15:00:00.000Z") as ReturnType<typeof DateTime.local>
    );
    mockedUseProfessionalsQuery.mockReturnValue({
      data: { professionals: [{ id: "professional-1", name: "Ana" }] },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useProfessionalsQuery>);
    mockedUseServicesQuery.mockReturnValue({
      data: { services: [{ id: "service-1", name: "Consulta" }] },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useServicesQuery>);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("renderiza loading por bloco enquanto a query esta pendente", async () => {
    const deferred = createDeferredPromise<typeof successResponse>();
    mockedDashboardService.getSummary.mockReturnValue(deferred.promise);

    renderWithProviders(<DashboardPage />);

    expect(
      screen.getByLabelText("Carregando dashboard operacional")
    ).toBeInTheDocument();
    expect(mockedDashboardService.getSummary).toHaveBeenCalledWith({
      date: "2026-03-30",
      professionalId: undefined,
      serviceId: undefined,
    });
  });

  test("renderiza estado vazio com KPIs zerados e listas vazias", async () => {
    mockedDashboardService.getSummary.mockResolvedValue({
      ...successResponse,
      totals: {
        totalBookings: 0,
        confirmed: 0,
        pending: 0,
        cancelled: 0,
        completed: 0,
      },
      occupancy: {
        availableMinutes: 0,
        bookedMinutes: 0,
        percentage: 0,
      },
      todayBookings: [],
      upcomingBookings: [],
      professionalOccupancy: [],
    });

    renderWithProviders(<DashboardPage />);

    expect(await screen.findByText("Dashboard operacional")).toBeInTheDocument();
    expect(screen.getByText("Nenhum agendamento")).toBeInTheDocument();
    expect(screen.getByText("Sem proximos atendimentos")).toBeInTheDocument();
    expect(screen.getByText("Sem ocupacao por profissional")).toBeInTheDocument();
    expect(screen.getAllByText("0")).not.toHaveLength(0);
  });

  test("renderiza erro global e permite retry", async () => {
    mockedDashboardService.getSummary.mockRejectedValueOnce(
      new ApiError(500, "INTERNAL_ERROR", "Falha ao carregar dashboard", "req-1")
    );

    renderWithProviders(<DashboardPage />);

    expect(await screen.findByText("Falha ao carregar o dashboard")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tentar novamente" })).toBeInTheDocument();

    mockedDashboardService.getSummary.mockResolvedValueOnce(successResponse);
    screen.getByRole("button", { name: "Tentar novamente" }).click();

    await waitFor(() => {
      expect(screen.getByText("Agenda do dia")).toBeInTheDocument();
    });
  });

  test("renderiza sucesso com fallback de cliente nulo e dados do backend", async () => {
    mockedDashboardService.getSummary.mockResolvedValue(successResponse);

    renderWithProviders(<DashboardPage />);

    expect(await screen.findByText("Agenda do dia")).toBeInTheDocument();
    expect(screen.getAllByText("62.50%")).toHaveLength(2);
    expect(screen.getByText("Cliente nao informado")).toBeInTheDocument();
    expect(screen.getByText("Bruno")).toBeInTheDocument();
    expect(screen.getAllByText("Ana")).toHaveLength(2);
    expect(screen.getByText("Retorno")).toBeInTheDocument();
    expect(screen.getAllByText("America/Sao_Paulo")).toHaveLength(2);
    expect(mockedDashboardService.getSummary).toHaveBeenCalledWith({
      date: "2026-03-30",
      professionalId: undefined,
      serviceId: undefined,
    });
  });
});
