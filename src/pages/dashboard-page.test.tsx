import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { DateTime } from "luxon";
import { DashboardPage } from "@/pages/dashboard-page";
import { renderWithProviders } from "@/test/render";
import { dashboardService } from "@/services/dashboard-service";
import { bookingsService } from "@/services/bookings-service";
import { useProfessionalsQuery } from "@/hooks/use-professionals-query";
import { useServicesQuery } from "@/hooks/use-services-query";
import { ApiError } from "@/types/api";

vi.mock("@/services/dashboard-service", () => ({
  dashboardService: {
    getSummary: vi.fn(),
  },
}));
vi.mock("@/services/bookings-service", () => ({
  bookingsService: {
    create: vi.fn(),
    cancel: vi.fn(),
    reschedule: vi.fn(),
    getById: vi.fn(),
    list: vi.fn(),
  },
}));
vi.mock("@/hooks/use-professionals-query", () => ({
  useProfessionalsQuery: vi.fn(),
}));
vi.mock("@/hooks/use-services-query", () => ({
  useServicesQuery: vi.fn(),
}));

const mockedDashboardService = vi.mocked(dashboardService);
const mockedBookingsService = vi.mocked(bookingsService);
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
      customerEmail: null,
      customerPhone: null,
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
      customerEmail: "bruno@example.com",
      customerPhone: "+55 (11) 91234-5678",
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
      status: undefined,
      customerName: undefined,
      customerPhone: undefined,
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
    expect(screen.getByText("bruno@example.com • +55 (11) 91234-5678")).toBeInTheDocument();
    expect(screen.queryByText(/null • null/i)).not.toBeInTheDocument();
    expect(screen.getAllByText("Ana")).toHaveLength(2);
    expect(screen.getByText("Retorno")).toBeInTheDocument();
    expect(screen.getAllByText("America/Sao_Paulo")).toHaveLength(2);
    expect(mockedDashboardService.getSummary).toHaveBeenCalledWith({
      date: "2026-03-30",
      professionalId: undefined,
      serviceId: undefined,
      status: undefined,
      customerName: undefined,
      customerPhone: undefined,
    });
  });

  test("reagenda booking confirmado e exibe feedback de sucesso", async () => {
    mockedDashboardService.getSummary.mockResolvedValue(successResponse);
    mockedBookingsService.reschedule.mockResolvedValue({
      booking: {
        id: "booking-1",
        status: "CONFIRMED",
        start: "2026-03-30T13:00:00.000Z",
        end: "2026-03-30T14:00:00.000Z",
        rescheduledAt: "2026-03-30T13:05:00.000Z",
      },
    });

    renderWithProviders(<DashboardPage />);

    await screen.findByText("Agenda do dia");

    const user = userEvent.setup();
    const actionButtons = screen.getAllByLabelText("Acoes do agendamento");

    await user.click(actionButtons[0]);
    await screen.findByRole("menu");
    await user.click(screen.getByRole("menuitem", { name: "Reagendar" }));

    const startInput = screen.getByLabelText("Novo horario") as HTMLInputElement;
    fireEvent.change(startInput, { target: { value: "2026-03-30T10:00" } });

    await user.click(screen.getByRole("button", { name: "Confirmar reagendamento" }));

    await waitFor(() => {
      expect(mockedBookingsService.reschedule).toHaveBeenCalledWith("booking-1", {
        start: "2026-03-30T13:00:00.000Z",
        reason: undefined,
      });
    });

    expect(await screen.findByText("Agendamento reagendado com sucesso.")).toBeInTheDocument();
  });

  test("exibe erro especifico quando a API retorna BOOKING_CONFLICT", async () => {
    mockedDashboardService.getSummary.mockResolvedValue(successResponse);
    mockedBookingsService.reschedule.mockRejectedValue(
      new ApiError(409, "BOOKING_CONFLICT", "Time slot is no longer available", "req-1")
    );

    renderWithProviders(<DashboardPage />);

    await screen.findByText("Agenda do dia");

    const user = userEvent.setup();
    await user.click(screen.getAllByLabelText("Acoes do agendamento")[0]);
    await screen.findByRole("menu");
    await user.click(screen.getByRole("menuitem", { name: "Reagendar" }));

    fireEvent.change(screen.getByLabelText("Novo horario"), { target: { value: "2026-03-30T10:00" } });

    await user.click(screen.getByRole("button", { name: "Confirmar reagendamento" }));

    expect(
      await screen.findByText(
        "Este horario nao esta mais disponivel. Escolha outro horario e tente novamente."
      )
    ).toBeInTheDocument();
  });

  test("exibe erro especifico quando a API retorna BOOKING_ALREADY_RESOLVED", async () => {
    mockedDashboardService.getSummary.mockResolvedValue(successResponse);
    mockedBookingsService.reschedule.mockRejectedValue(
      new ApiError(409, "BOOKING_ALREADY_RESOLVED", "O agendamento ja foi resolvido.", "req-1")
    );

    renderWithProviders(<DashboardPage />);

    await screen.findByText("Agenda do dia");

    const user = userEvent.setup();
    await user.click(screen.getAllByLabelText("Acoes do agendamento")[0]);
    await screen.findByRole("menu");
    await user.click(screen.getByRole("menuitem", { name: "Reagendar" }));

    fireEvent.change(screen.getByLabelText("Novo horario"), { target: { value: "2026-03-30T10:00" } });

    await user.click(screen.getByRole("button", { name: "Confirmar reagendamento" }));

    expect(
      await screen.findByText(
        "Este agendamento ja foi resolvido. Atualize a lista e tente novamente."
      )
    ).toBeInTheDocument();
  });
});
