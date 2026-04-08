import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi, beforeEach } from "vitest";
import { SlotsPage } from "@/pages/slots-page";
import { renderWithProviders } from "@/test/render";
import { ApiError } from "@/types/api";
import { professionalsService } from "@/services/professionals-service";
import { servicesService } from "@/services/services-service";
import { slotsService } from "@/services/slots-service";
import { bookingsService } from "@/services/bookings-service";

vi.mock("@/services/professionals-service", () => ({
  professionalsService: {
    list: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("@/services/services-service", () => ({
  servicesService: {
    list: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("@/services/slots-service", () => ({
  slotsService: {
    listAvailable: vi.fn(),
  },
}));

vi.mock("@/services/bookings-service", () => ({
  bookingsService: {
    create: vi.fn(),
  },
}));

vi.mock("@/session/session-storage", () => ({
  getStoredToken: vi.fn(() => null),
  setStoredToken: vi.fn(),
  clearStoredToken: vi.fn(),
  subscribeToStoredToken: vi.fn(() => () => undefined),
}));

const mockedProfessionalsService = vi.mocked(professionalsService);
const mockedServicesService = vi.mocked(servicesService);
const mockedSlotsService = vi.mocked(slotsService);
const mockedBookingsService = vi.mocked(bookingsService);

const professionalsResponse = {
  professionals: [
    {
      id: "professional-1",
      name: "Ana",
      slug: "ana",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
  ],
};

const servicesResponse = {
  services: [
    {
      id: "service-1",
      tenantId: "tenant-1",
      name: "Consulta",
      durationInMinutes: 60,
      price: 100,
      isActive: true,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
  ],
};

const slotsResponse = {
  professionalId: "professional-1",
  serviceId: "service-1",
  date: "2026-04-01",
  tenantTimezone: "America/Sao_Paulo",
  slots: [
    {
      start: "2026-04-01T12:00:00.000Z",
      end: "2026-04-01T13:00:00.000Z",
    },
  ],
};

const refreshedSlotsResponse = {
  ...slotsResponse,
  slots: [
    {
      start: "2026-04-01T13:00:00.000Z",
      end: "2026-04-01T14:00:00.000Z",
    },
  ],
};

const confirmedBooking = {
  id: "booking-1",
  professionalId: "professional-1",
  serviceId: "service-1",
  start: "2026-04-01T12:00:00.000Z",
  end: "2026-04-01T13:00:00.000Z",
  status: "CONFIRMED" as const,
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

async function selectOption(user: ReturnType<typeof userEvent.setup>, triggerName: string, optionName: string) {
  const triggerLabel = await screen.findByText(triggerName);
  const trigger = triggerLabel.closest("button");

  if (!trigger) {
    throw new Error(`Trigger nao encontrado para ${triggerName}`);
  }

  await user.click(trigger);
  await user.click(await screen.findByRole("option", { name: optionName }));
}

async function loadSlotsPage(user: ReturnType<typeof userEvent.setup>) {
  renderWithProviders(<SlotsPage />);

  await selectOption(user, "Selecione um profissional", "Ana");
  await selectOption(user, "Selecione um servico", "Consulta");
  fireEvent.change(screen.getByLabelText("Data"), {
    target: {
      value: "2026-04-01",
    },
  });
  await user.click(screen.getByRole("button", { name: "Buscar horarios" }));

  return screen.findByRole("button", { name: /09:00 - 10:00/i });
}

describe("SlotsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedProfessionalsService.list.mockResolvedValue(professionalsResponse);
    mockedServicesService.list.mockResolvedValue(servicesResponse);
    mockedSlotsService.listAvailable.mockResolvedValue(slotsResponse);
  });

  test("busca e renderiza slots com CTA de confirmacao desabilitado sem selecao", async () => {
    const user = userEvent.setup();

    const slotButton = await loadSlotsPage(user);

    expect(slotButton).toBeInTheDocument();
    expect(mockedSlotsService.listAvailable).toHaveBeenCalledWith({
      professionalId: "professional-1",
      serviceId: "service-1",
      date: "2026-04-01",
    });
    expect(
      screen.getByRole("button", { name: "Confirmar agendamento" })
    ).toBeDisabled();
  });

  test("bloqueia slots, busca e confirmacao durante pending", async () => {
    const user = userEvent.setup();
    const pendingBooking = createDeferredPromise<typeof confirmedBooking>();
    mockedBookingsService.create.mockReturnValue(pendingBooking.promise);

    const slotButton = await loadSlotsPage(user);

    await user.click(slotButton);
    await user.click(screen.getByRole("button", { name: "Confirmar agendamento" }));

    expect(mockedBookingsService.create).toHaveBeenCalledWith({
      professionalId: "professional-1",
      serviceId: "service-1",
      start: "2026-04-01T12:00:00.000Z",
    });
    expect(screen.getByRole("button", { name: "Confirmando..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Buscar horarios" })).toBeDisabled();
    expect(slotButton).toBeDisabled();

    pendingBooking.resolve(confirmedBooking);
    await screen.findByText("Agendamento confirmado");
  });

  test("trata 409 limpando a selecao e oferecendo refresh manual", async () => {
    const user = userEvent.setup();
    mockedSlotsService.listAvailable
      .mockResolvedValueOnce(slotsResponse)
      .mockResolvedValueOnce(refreshedSlotsResponse);
    mockedBookingsService.create.mockRejectedValue(
      new ApiError(409, "BOOKING_CONFLICT", "Time slot is no longer available", "req-1")
    );

    const slotButton = await loadSlotsPage(user);

    await user.click(slotButton);
    expect(within(slotButton).getByText("Selecionado")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Confirmar agendamento" }));

    expect(
      await screen.findByText(
        "Este horario acabou de ser reservado. Escolha outro horario."
      )
    ).toBeInTheDocument();
    expect(screen.getByText("Selecione um horario para continuar.")).toBeInTheDocument();
    expect(within(slotButton).getByText("Selecionar")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Confirmar agendamento" })
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Atualizar horarios" }));

    await waitFor(() => {
      expect(mockedSlotsService.listAvailable).toHaveBeenCalledTimes(2);
    });
    expect(screen.queryByRole("button", { name: /09:00 - 10:00/i })).not.toBeInTheDocument();
    expect(await screen.findByRole("button", { name: /10:00 - 11:00/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirmar agendamento" })).toBeDisabled();
  });

  test("mantem selecao em erro generico e permite retry manual", async () => {
    const user = userEvent.setup();
    mockedBookingsService.create
      .mockRejectedValueOnce(new ApiError(500, "INTERNAL_ERROR", "Falha", "req-2"))
      .mockResolvedValueOnce(confirmedBooking);

    const slotButton = await loadSlotsPage(user);

    await user.click(slotButton);
    await user.click(screen.getByRole("button", { name: "Confirmar agendamento" }));

    expect(
      await screen.findByText("Nao foi possivel confirmar o agendamento agora. Tente novamente.")
    ).toBeInTheDocument();
    expect(within(slotButton).getByText("Selecionado")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(await screen.findByText("Agendamento confirmado")).toBeInTheDocument();
  });

  test("mantem sucesso na mesma tela apos confirmacao", async () => {
    const user = userEvent.setup();
    const apiBooking = {
      ...confirmedBooking,
      start: "2026-04-01T14:00:00.000Z",
      end: "2026-04-01T15:00:00.000Z",
    };
    mockedBookingsService.create.mockResolvedValue(apiBooking);

    const slotButton = await loadSlotsPage(user);

    await user.click(slotButton);
    await user.click(screen.getByRole("button", { name: "Confirmar agendamento" }));

    expect(await screen.findByText("Agendamento confirmado")).toBeInTheDocument();
    expect(screen.getByText("11:00 - 12:00")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Consultar outros horarios" })).toBeInTheDocument();
  });
});
