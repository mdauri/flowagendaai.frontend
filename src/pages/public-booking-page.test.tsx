import { DateTime } from "luxon";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, beforeEach, expect, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { PublicBookingPage } from "./public-booking-page";
import { ApiError, BOOKING_CONFLICT_ERROR_CODE } from "@/types/api";
import type {
  CreatePublicBookingInput,
  CreatePublicBookingResponse,
} from "@/types/public-booking";
import type { MutateFunction, UseMutationResult } from "@tanstack/react-query";

const mockProfessional = {
  id: "prof-123",
  name: "Maria Silva",
  slug: "maria-silva",
  tenantId: "tenant-1",
  tenantTimezone: "America/Sao_Paulo",
  tenantName: "Test Studio",
  tenantSlug: "test-studio",
  tenantLogoUrl: null,
  tenantCoverImageUrl: null,
  tenantCoverThumbnailUrl: null,
  tenantPublicAddress: null,
};

const mockServices = [
  { id: "service-1", name: "Corte Feminino", durationInMinutes: 60 },
  { id: "service-2", name: "Coloração", durationInMinutes: 90 },
];

const mockSlotStart = DateTime.local().startOf("day").plus({ hours: 10 });
const mockSlot = {
  start: mockSlotStart.toUTC().toISO(),
  end: mockSlotStart.plus({ minutes: 60 }).toUTC().toISO(),
};

const mockBooking: CreatePublicBookingResponse = {
  id: "booking-1",
  professionalId: mockProfessional.id,
  serviceId: mockServices[0].id,
  start: mockSlot.start,
  end: mockSlot.end,
  customerName: "João Silva",
  customerPhone: "+55 (11) 91234-5678",
  professionalName: mockProfessional.name,
  serviceName: mockServices[0].name,
};

type PublicBookingMutation = UseMutationResult<
  CreatePublicBookingResponse,
  unknown,
  CreatePublicBookingInput,
  unknown
>;

const mutateMock = vi.fn<
  MutateFunction<CreatePublicBookingResponse, unknown, CreatePublicBookingInput, unknown>
>();

const mockProfessionalQuery = vi.fn();
const mockServicesQuery = vi.fn();
const mockAvailableDatesQuery = vi.fn();
const mockSlotsQuery = vi.fn();
const mockCreateBookingMutation = {
  mutate: mutateMock,
  mutateAsync: mutateMock,
  status: "idle" as const,
  error: null,
  data: undefined,
  isError: false,
  isSuccess: false,
} as unknown as PublicBookingMutation;

vi.mock("@/hooks/use-public-professional-query", () => ({
  usePublicProfessionalQuery: () => mockProfessionalQuery(),
}));
vi.mock("@/hooks/use-public-services-query", () => ({
  usePublicServicesQuery: () => mockServicesQuery(),
}));
vi.mock("@/hooks/use-public-available-dates-query", () => ({
  usePublicAvailableDatesQuery: () => mockAvailableDatesQuery(),
}));
vi.mock("@/hooks/use-public-slots-query", () => ({
  usePublicSlotsQuery: () => mockSlotsQuery(),
}));
vi.mock("@/hooks/use-create-public-booking-mutation", () => ({
  useCreatePublicBookingMutation: () => mockCreateBookingMutation,
}));

const createProfessionalResponse = (overrides = {}) => ({
  data: mockProfessional,
  isLoading: false,
  isError: false,
  error: null,
  refetch: vi.fn(),
  ...overrides,
});

const createServicesResponse = (overrides = {}) => ({
  data: mockServices,
  isLoading: false,
  isError: false,
  error: null,
  refetch: vi.fn(),
  ...overrides,
});

const createAvailableDatesResponse = (overrides = {}) => ({
  data: {
    tenantTimezone: mockProfessional.tenantTimezone,
    availableDates: [DateTime.now().setZone(mockProfessional.tenantTimezone).toISODate() ?? ""],
  },
  isLoading: false,
  isError: false,
  error: null,
  refetch: vi.fn(),
  ...overrides,
});

const createSlotsResponse = (overrides = {}) => ({
  data: { slots: [mockSlot], tenantTimezone: mockProfessional.tenantTimezone },
  isLoading: false,
  isError: false,
  error: null,
  refetch: vi.fn(),
  ...overrides,
});

const createMutationMock = (
  implementation: MutateFunction<CreatePublicBookingResponse, unknown, CreatePublicBookingInput, unknown>
) => {
  mutateMock.mockImplementation(implementation);
};

beforeEach(() => {
  mockProfessionalQuery.mockReturnValue(createProfessionalResponse());
  mockServicesQuery.mockReturnValue(createServicesResponse());
  mockAvailableDatesQuery.mockReturnValue(createAvailableDatesResponse());
  mockSlotsQuery.mockReturnValue(createSlotsResponse());
  mutateMock.mockReset();
  mockCreateBookingMutation.status = "idle";
  mockCreateBookingMutation.isError = false;
  mockCreateBookingMutation.isSuccess = false;
  mockCreateBookingMutation.error = null;
  mockCreateBookingMutation.data = undefined;
});

async function progressToSlotStep(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByText(/Corte Feminino/i));
  const continueButton = screen.getByRole("button", { name: /Continuar/i });
  await user.click(continueButton);

  const todayLabel = DateTime.now().setZone(mockProfessional.tenantTimezone).day.toString();
  const dayButtons = await screen.findAllByRole("button", {
    name: new RegExp("^" + todayLabel + "$"),
  });
  const dayButton = dayButtons.find((button) => !button.hasAttribute("disabled"));
  if (!dayButton) throw new Error("Calendar day not found");
  await user.click(dayButton);

  const showSlotsButton = screen.getByRole("button", { name: /Ver horários/i });
  await user.click(showSlotsButton);
  return screen.getByRole("button", { name: /Continuar/i });
}

const renderPage = () =>
  renderWithProviders(<PublicBookingPage />, { route: "/p/maria-silva", withRouter: true });

describe("PublicBookingPage", () => {
  it("renders loading skeleton while professional data is loading", () => {
    mockProfessionalQuery.mockReturnValue(createProfessionalResponse({ isLoading: true }));
    renderPage();

    const skeleton = screen.getByText((content, element) =>
      element?.getAttribute("aria-busy") === "true"
    );
    expect(skeleton).toBeInTheDocument();
  });

  it("shows 404 state when professional not found", () => {
    mockProfessionalQuery.mockReturnValue(
      createProfessionalResponse({ isLoading: false, isError: true, error: new ApiError(404, "NOT_FOUND", "not found", "req") })
    );
    renderPage();

    expect(screen.getByRole("heading", { name: /Profissional não encontrado/i })).toBeInTheDocument();
  });

  it("shows connection error state when professional request fails", () => {
    mockProfessionalQuery.mockReturnValue(
      createProfessionalResponse({
        isLoading: false,
        isError: true,
        error: new ApiError(500, "HTTP_ERROR", "failure", "req"),
      })
    );
    renderPage();

    expect(screen.getByRole("heading", { name: /Erro de conexão/i })).toBeInTheDocument();
  });

  it("allows selecting a service and shows the date step", async () => {
    renderPage();
    const user = userEvent.setup();

    const serviceCard = screen.getByText(/Corte Feminino/i);
    await user.click(serviceCard);

    const continueButton = screen.getByRole("button", { name: /Continuar/i });
    expect(continueButton).toBeEnabled();
    await user.click(continueButton);

    expect(screen.getByText(/Escolha a data/i)).toBeInTheDocument();
    expect(screen.getByText(/Horários em/i)).toBeInTheDocument();
  });

  it("shows slots and allows progressing to customer data", async () => {
    renderPage();
    const user = userEvent.setup();

    await progressToSlotStep(user);

    const slotButton = await screen.findByRole("button", { name: /10:00 – 11:00/i });
    await user.click(slotButton);
    const continueButton = screen.getByRole("button", { name: /Continuar/i });
    await user.click(continueButton);

    expect(screen.getByText(/Complete seus dados/i)).toBeInTheDocument();
  });

  it("keeps unavailable day disabled in calendar", async () => {
    mockAvailableDatesQuery.mockReturnValue(
      createAvailableDatesResponse({ data: { tenantTimezone: mockProfessional.tenantTimezone, availableDates: [] } })
    );
    renderPage();
    const user = userEvent.setup();

    await user.click(screen.getByText(/Corte Feminino/i));
    await user.click(screen.getByRole("button", { name: /Continuar/i }));

    const todayLabel = DateTime.now().setZone(mockProfessional.tenantTimezone).day.toString();
    const dayButtons = await screen.findAllByRole("button", {
      name: new RegExp("^" + todayLabel + "$"),
    });
    const enabledToday = dayButtons.find((button) => !button.hasAttribute("disabled"));

    expect(enabledToday).toBeUndefined();
    expect(screen.getByRole("button", { name: /Ver horários/i })).toBeDisabled();
  });

  it("shows empty state when there are no slots", async () => {
    mockSlotsQuery.mockReturnValue(
      createSlotsResponse({ data: { slots: [], tenantTimezone: mockProfessional.tenantTimezone } })
    );
    renderPage();
    const user = userEvent.setup();

    await progressToSlotStep(user);

    expect(screen.getByText(/Sem horários disponíveis/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Recarregar/i })).not.toBeInTheDocument();
  });

  it("shows retry feedback when slot request is rate limited", async () => {
    mockSlotsQuery.mockReturnValue(
      createSlotsResponse({
        data: undefined,
        isError: true,
        error: new ApiError(429, "RATE_LIMIT", "too many", "req", undefined, 15),
      })
    );
    renderPage();
    const user = userEvent.setup();

    await progressToSlotStep(user);

    expect(screen.getByText(/Tente novamente em 15 segundos/i)).toBeInTheDocument();
  });

  it("shows success screen after booking", async () => {
    createMutationMock((variables, options) => {
      options?.onSuccess?.(mockBooking, variables, undefined, {} as never);
      return Promise.resolve(mockBooking);
    });
    renderPage();
    const user = userEvent.setup();

    const continueButton = await progressToSlotStep(user);
    const slotButton = await screen.findByRole("button", { name: /10:00 – 11:00/i });
    await user.click(slotButton);
    await user.click(continueButton);

    await user.type(screen.getByPlaceholderText(/Seu nome/i), "João da Silva");
    await user.type(screen.getByPlaceholderText(/\+55 \(11\) 9xxxx-xxxx/i), "11912345678");
    await user.type(screen.getByRole("textbox", { name: /Observação/i }), "Sem tintura");

    const confirmButton = screen.getByRole("button", { name: /Confirmar agendamento/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText(/Agendamento confirmado!/i)).toBeInTheDocument();
    });
  });

  it("shows conflict error when booking returns 409", async () => {
    const conflictError = new ApiError(409, BOOKING_CONFLICT_ERROR_CODE, "conflict", "req");
    createMutationMock((variables, options) => {
      options?.onError?.(conflictError, variables, undefined, {} as never);
      return Promise.resolve(mockBooking);
    });
    renderPage();
    const user = userEvent.setup();

    await progressToSlotStep(user);

    await user.click(await screen.findByRole("button", { name: /10:00 – 11:00/i }));
    const continueButton = screen.getByRole("button", { name: /Continuar/i });
    await user.click(continueButton);

    const confirmButton = screen.getByRole("button", { name: /Confirmar agendamento/i });
    await user.type(screen.getByPlaceholderText(/Seu nome/i), "João da Silva");
    await user.type(screen.getByPlaceholderText(/\+55 \(11\) 9xxxx-xxxx/i), "11912345678");
    await user.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText(/Horário em disputa/i)).toBeInTheDocument();
    });
  });

  it("shows rate limit message when booking returns 429", async () => {
    const rateLimitError = new ApiError(429, "RATE_LIMIT", "too many", "req", undefined, 42);
    createMutationMock((variables, options) => {
      options?.onError?.(rateLimitError, variables, undefined, {} as never);
      return Promise.resolve(mockBooking);
    });
    renderPage();
    const user = userEvent.setup();

    await progressToSlotStep(user);

    await user.click(await screen.findByRole("button", { name: /10:00 – 11:00/i }));
    const continueButton = screen.getByRole("button", { name: /Continuar/i });
    await user.click(continueButton);

    await user.type(screen.getByPlaceholderText(/Seu nome/i), "João da Silva");
    await user.type(screen.getByPlaceholderText(/\+55 \(11\) 9xxxx-xxxx/i), "11912345678");
    const confirmButton = screen.getByRole("button", { name: /Confirmar agendamento/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText(/Tente novamente em 42 segundos/i)).toBeInTheDocument();
    });
  });
});
