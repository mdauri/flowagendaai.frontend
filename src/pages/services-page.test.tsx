import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ServicesPage } from "@/pages/services-page";
import { renderWithProviders } from "@/test/render";

const mocks = vi.hoisted(() => ({
  refetchMock: vi.fn(),
}));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    user: { role: "mandant" },
    tenant: { timezone: "America/Sao_Paulo" },
  }),
}));

vi.mock("@/hooks/use-services-query", () => ({
  useServicesQuery: () => ({
    data: {
      services: [
        {
          id: "service-1",
          tenantId: "tenant-1",
          name: "Corte tradicional",
          description: "Corte classico.",
          durationInMinutes: 60,
          price: 50,
          imageUrl: null,
          thumbnailUrl: null,
          isActive: true,
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

vi.mock("@/hooks/use-create-service-mutation", () => ({
  useCreateServiceMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

vi.mock("@/hooks/use-service-mutations", () => ({
  useUpdateServiceMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useDeleteServiceMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

describe("ServicesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("preenche o formulario inline ao iniciar edicao", async () => {
    const user = userEvent.setup();

    renderWithProviders(<ServicesPage />, { route: "/app/services", withRouter: true });

    await user.click(screen.getByRole("button", { name: "Editar" }));

    expect(await screen.findByRole("heading", { name: "Editar servico" })).toBeInTheDocument();
    expect(screen.getByDisplayValue("Corte tradicional")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancelar edicao" })).toBeInTheDocument();
  });
});
