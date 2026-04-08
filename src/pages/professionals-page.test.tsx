import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProfessionalsPage } from "@/pages/professionals-page";
import { renderWithProviders } from "@/test/render";
import { ApiError } from "@/types/api";

const mocks = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  deleteMutateAsyncMock: vi.fn(),
  refetchMock: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mocks.navigateMock,
  };
});

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    user: { role: "mandant" },
    tenant: { timezone: "America/Sao_Paulo" },
  }),
}));

vi.mock("@/hooks/use-professionals-query", () => ({
  useProfessionalsQuery: () => ({
    data: {
      professionals: [
        {
          id: "professional-1",
          name: "Ana Souza",
          slug: "ana-souza",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
    },
    isLoading: false,
    isError: false,
    isFetching: false,
    refetch: mocks.refetchMock,
  }),
}));

vi.mock("@/hooks/use-create-professional-mutation", () => ({
  useCreateProfessionalMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

vi.mock("@/hooks/use-update-professional-mutation", () => ({
  useUpdateProfessionalMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

vi.mock("@/hooks/use-delete-professional-mutation", () => ({
  useDeleteProfessionalMutation: () => ({
    mutateAsync: mocks.deleteMutateAsyncMock,
    isPending: false,
  }),
}));

describe("ProfessionalsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("redireciona para a tela de remocao quando delete retorna 409 de impacted bookings", async () => {
    const user = userEvent.setup();
    mocks.deleteMutateAsyncMock.mockRejectedValue(
      new ApiError(
        409,
        "PROFESSIONAL_HAS_IMPACTED_BOOKINGS",
        "Existem bookings impactados.",
        "req-1"
      )
    );

    renderWithProviders(<ProfessionalsPage />, { route: "/app/professionals", withRouter: true });

    await user.click(screen.getByRole("button", { name: "Remover" }));
    await user.click(screen.getByRole("button", { name: "Confirmar remocao" }));

    expect(mocks.navigateMock).toHaveBeenCalledWith("/app/professionals/professional-1/removal");
  });

  it("preenche o formulario inline ao iniciar edicao", async () => {
    const user = userEvent.setup();

    renderWithProviders(<ProfessionalsPage />, { route: "/app/professionals", withRouter: true });

    await user.click(screen.getByRole("button", { name: "Editar" }));

    expect(await screen.findByRole("heading", { name: "Editar profissional" })).toBeInTheDocument();
    expect(screen.getByLabelText("Nome completo")).toHaveValue("Ana Souza");
    expect(screen.getByRole("button", { name: "Cancelar edicao" })).toBeInTheDocument();
  });
});
