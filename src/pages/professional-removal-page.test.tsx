import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProfessionalRemovalPage } from "@/pages/professional-removal-page";
import { renderWithProviders } from "@/test/render";
import { ApiError } from "@/types/api";

const mocks = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  refetchMock: vi.fn(),
  reassignMock: vi.fn(),
  cancelMock: vi.fn(),
  finalizeMock: vi.fn(),
}));
const queryState = {
  data: undefined as
    | {
        professional: { id: string; name: string };
        bookings: Array<{
          id: string;
          start: string;
          end: string;
          status: string;
          customerName: string | null;
          customerPhone: string | null;
          customerEmail: string | null;
          service: { id: string; name: string; durationInMinutes: number };
          eligibleProfessionals: Array<{ id: string; name: string }>;
        }>;
      }
    | undefined,
  isLoading: false,
  isError: false,
};

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mocks.navigateMock,
    useParams: () => ({ professionalId: "professional-1" }),
  };
});

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    user: { role: "mandant" },
    tenant: { timezone: "America/Sao_Paulo" },
  }),
}));

vi.mock("@/hooks/use-impacted-professional-bookings-query", () => ({
  useImpactedProfessionalBookingsQuery: () => ({
    ...queryState,
    refetch: mocks.refetchMock,
  }),
}));

vi.mock("@/services/professionals-service", () => ({
  professionalsService: {
    reassignImpactedBooking: mocks.reassignMock,
    cancelImpactedBooking: mocks.cancelMock,
    finalizeRemoval: mocks.finalizeMock,
  },
}));

describe("ProfessionalRemovalPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryState.data = undefined;
    queryState.isLoading = false;
    queryState.isError = false;
  });

  it("renderiza empty state e finaliza a remocao quando nao ha bookings pendentes", async () => {
    const user = userEvent.setup();
    queryState.data = {
      professional: { id: "professional-1", name: "Ana Souza" },
      bookings: [],
    };
    mocks.finalizeMock.mockResolvedValue({ removed: true });

    renderWithProviders(<ProfessionalRemovalPage />, {
      route: "/app/professionals/professional-1/removal",
      withRouter: true,
    });

    expect(screen.getByText("Nenhum agendamento pendente")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Concluir remocao" }));

    expect(mocks.finalizeMock).toHaveBeenCalledWith("professional-1");
    expect(mocks.navigateMock).toHaveBeenCalledWith("/app/professionals");
  });

  it("renderiza erro de pagina quando a API falha ao cancelar booking", async () => {
    const user = userEvent.setup();
    queryState.data = {
      professional: { id: "professional-1", name: "Ana Souza" },
      bookings: [
        {
          id: "booking-1",
          start: "2026-04-01T10:00:00.000Z",
          end: "2026-04-01T11:00:00.000Z",
          status: "CONFIRMED",
          customerName: "Maria",
          customerPhone: "11999999999",
          customerEmail: "maria@example.com",
          service: {
            id: "service-1",
            name: "Consulta",
            durationInMinutes: 60,
          },
          eligibleProfessionals: [{ id: "professional-2", name: "Bruno Lima" }],
        },
      ],
    };
    mocks.cancelMock.mockRejectedValue(
      new ApiError(409, "BOOKING_ALREADY_RESOLVED", "Booking ja resolvido.", "req-1")
    );

    renderWithProviders(<ProfessionalRemovalPage />, {
      route: "/app/professionals/professional-1/removal",
      withRouter: true,
    });

    await user.click(screen.getByRole("button", { name: "Cancelar booking" }));

    expect(await screen.findByText("Booking ja resolvido.")).toBeInTheDocument();
  });
});
