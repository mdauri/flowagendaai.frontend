import { describe, expect, test, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MinhaAgendaPage } from "@/pages/minha-agenda-page";
import { renderWithProviders } from "@/test/render";

const authState = {
  token: "token-auth",
  user: {
    id: "user-1",
    name: "Profissional",
    email: "professional@test.com",
    role: "professional",
    professionalId: "professional-1",
  },
  tenant: {
    id: "tenant-1",
    name: "Tenant Demo",
    timezone: "America/Sao_Paulo",
    logoUrl: null,
    coverImageUrl: null,
    publicAddress: null,
  },
  isAuthenticated: true,
  isBootstrapping: false,
  error: null,
  logout: vi.fn(),
  refetchCurrentUser: vi.fn(),
};

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => authState,
}));

const bookingsQueryState = {
  data: { items: [] as any[], page: 1, pageSize: 20, total: 0 },
  isLoading: false,
  isError: false,
  isSuccess: true,
  error: null as unknown,
  refetch: vi.fn(),
};

vi.mock("@/hooks/use-bookings-query", () => ({
  useBookingsQuery: () => bookingsQueryState,
}));

const bookingByIdQueryState = {
  data: null as any,
  isLoading: false,
  isError: false,
  error: null as unknown,
  refetch: vi.fn(),
};

vi.mock("@/hooks/use-booking-by-id-query", () => ({
  useBookingByIdQuery: () => bookingByIdQueryState,
}));

describe("MinhaAgendaPage", () => {
  test("renderiza empty state quando nao ha itens", () => {
    bookingsQueryState.data = { items: [], page: 1, pageSize: 20, total: 0 };
    bookingsQueryState.isLoading = false;
    bookingsQueryState.isError = false;
    bookingsQueryState.isSuccess = true;

    renderWithProviders(<MinhaAgendaPage />, { route: "/app/minha-agenda", withRouter: true });

    expect(screen.getByText("Minha agenda")).toBeInTheDocument();
    expect(screen.getByText("Nenhum agendamento no periodo selecionado")).toBeInTheDocument();
  });

  test("renderiza erro e permite retry", async () => {
    const user = userEvent.setup();
    bookingsQueryState.isLoading = false;
    bookingsQueryState.isError = true;
    bookingsQueryState.isSuccess = false;

    renderWithProviders(<MinhaAgendaPage />, { route: "/app/minha-agenda", withRouter: true });

    expect(screen.getByText("Nao foi possivel carregar sua agenda")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(bookingsQueryState.refetch).toHaveBeenCalledTimes(1);
  });

  test("renderiza lista e abre/fecha detalhe", async () => {
    const user = userEvent.setup();
    bookingsQueryState.isError = false;
    bookingsQueryState.isSuccess = true;
    bookingsQueryState.data = {
      items: [
        {
          id: "booking-1",
          status: "CONFIRMED",
          start: "2026-04-22T10:00:00.000Z",
          end: "2026-04-22T10:30:00.000Z",
          professionalId: "professional-1",
          professionalName: "Ana",
          serviceId: "service-1",
          serviceName: "Corte",
          customerName: "Maria",
          customerPhone: "+5511999999999",
          customerEmail: "maria@example.com",
          createdAt: "2026-04-01T00:00:00.000Z",
          cancelledAt: null,
        },
      ],
      page: 1,
      pageSize: 20,
      total: 1,
    };

    bookingByIdQueryState.data = {
      booking: {
        id: "booking-1",
        status: "CONFIRMED",
        start: "2026-04-22T10:00:00.000Z",
        end: "2026-04-22T10:30:00.000Z",
        professionalId: "professional-1",
        professionalName: "Ana",
        serviceId: "service-1",
        serviceName: "Corte",
        customerName: "Maria",
        customerPhone: "+5511999999999",
        customerEmail: "maria@example.com",
        createdAt: "2026-04-01T00:00:00.000Z",
        cancelledAt: null,
      },
    };

    renderWithProviders(<MinhaAgendaPage />, { route: "/app/minha-agenda", withRouter: true });

    await user.click(screen.getByRole("button", { name: /Corte/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Detalhe do agendamento")).toBeInTheDocument();
    // "Corte" and "Ana" appear in list and in dialog; assert at least once.
    expect(screen.getAllByText("Corte").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Ana").length).toBeGreaterThan(0);
    expect(screen.getByText("+5511999999999")).toBeInTheDocument();
    expect(screen.getByText("maria@example.com")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Fechar" }));
    expect(screen.queryByText("Detalhe do agendamento")).not.toBeInTheDocument();
  });

  test("no detalhe, faz fallback para valores da lista quando o payload do detalhe vem incompleto/invalido", async () => {
    const user = userEvent.setup();
    bookingsQueryState.isError = false;
    bookingsQueryState.isSuccess = true;
    bookingsQueryState.data = {
      items: [
        {
          id: "booking-2",
          status: "CONFIRMED",
          start: "2026-05-06T10:00:00.000Z",
          end: "2026-05-06T10:30:00.000Z",
          professionalId: "professional-1",
          professionalName: "Cintia Pro",
          serviceId: "service-2",
          serviceName: "Escova",
          customerName: "Joana",
          customerPhone: "+5511888888888",
          customerEmail: "joana@example.com",
          createdAt: "2026-05-01T00:00:00.000Z",
          cancelledAt: null,
        },
      ],
      page: 1,
      pageSize: 20,
      total: 1,
    };

    // Simula backend/cliente retornando start/end invalidos e nomes vazios.
    bookingByIdQueryState.data = {
      booking: {
        id: "booking-2",
        status: "CONFIRMED",
        start: "not-a-date",
        end: "also-not-a-date",
        professionalId: "professional-1",
        professionalName: "",
        serviceId: "service-2",
        serviceName: "",
        customerName: null,
        customerPhone: null,
        customerEmail: null,
        createdAt: "invalid-created-at",
        cancelledAt: null,
      },
    };

    renderWithProviders(<MinhaAgendaPage />, { route: "/app/minha-agenda", withRouter: true });

    await user.click(screen.getByRole("button", { name: /Escova/i }));

    // Deve renderizar horário válido (fallback da lista), e não "Invalid DateTime".
    expect(screen.queryByText(/Invalid DateTime/i)).not.toBeInTheDocument();
    expect(screen.getAllByText("07:00 - 07:30").length).toBeGreaterThan(0);

    // Deve preencher Atendimento a partir da lista quando vazio no detalhe.
    expect(screen.getAllByText("Escova").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Cintia Pro").length).toBeGreaterThan(0);

    // Cliente deve exibir os dados da lista quando o detalhe vier sem informacoes.
    expect(screen.getAllByText("Joana").length).toBeGreaterThan(0);
    expect(screen.getAllByText("+5511888888888").length).toBeGreaterThan(0);
    expect(screen.getAllByText("joana@example.com").length).toBeGreaterThan(0);
  });
});
