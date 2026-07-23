import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { WaitlistPage } from "./waitlist-page";

const mockUseAuth = vi.fn();
const mockUseToast = vi.fn();
const mockServicesQuery = vi.fn();
const mockProfessionalsQuery = vi.fn();
const mockWaitlistQuery = vi.fn();
const mockCreateWaitlistMutation = vi.fn();
const mockDeleteWaitlistMutation = vi.fn();

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => mockUseToast(),
}));

vi.mock("@/hooks/use-services-query", () => ({
  useServicesQuery: () => mockServicesQuery(),
}));

vi.mock("@/hooks/use-professionals-query", () => ({
  useProfessionalsQuery: () => mockProfessionalsQuery(),
}));

vi.mock("@/hooks/use-waitlist-query", () => ({
  useWaitlistQuery: () => mockWaitlistQuery(),
}));

vi.mock("@/hooks/use-create-waitlist-mutation", () => ({
  useCreateWaitlistMutation: () => mockCreateWaitlistMutation(),
}));

vi.mock("@/hooks/use-delete-waitlist-mutation", () => ({
  useDeleteWaitlistMutation: () => mockDeleteWaitlistMutation(),
}));

describe("WaitlistPage", () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: {
        role: "admin",
      },
    });

    mockUseToast.mockReturnValue({
      toast: vi.fn(),
    });

    mockServicesQuery.mockReturnValue({
      data: {
        services: [{ id: "service-1", name: "Corte Feminino" }],
      },
      isLoading: false,
    });

    mockProfessionalsQuery.mockReturnValue({
      data: {
        professionals: [{ id: "prof-123", name: "Maria Silva" }],
      },
      isLoading: false,
    });

    mockWaitlistQuery.mockReturnValue({
      data: { items: [] },
      isLoading: false,
      isError: false,
      isFetching: false,
      refetch: vi.fn(),
    });

    mockCreateWaitlistMutation.mockReturnValue({
      isPending: false,
      mutateAsync: vi.fn(),
    });

    mockDeleteWaitlistMutation.mockReturnValue({
      mutateAsync: vi.fn(),
    });
  });

  it("hydrates the form from waitlist prefill query params", () => {
    renderWithProviders(<WaitlistPage />, {
      route:
        "/app/waitlist?customerName=Jo%C3%A3o+da+Silva&customerPhone=%2B55+%2811%29+91234-5678&serviceId=service-1&employeeId=prof-123&preferredDate=2026-07-24&notes=Cliente+quer+encaixe",
      withRouter: true,
    });

    expect(screen.getByLabelText(/Nome do cliente/i)).toHaveValue("João da Silva");
    expect(screen.getByLabelText(/Telefone/i)).toHaveValue("+55 (11) 91234-5678");
    expect(screen.getAllByLabelText(/Data desejada/i)[0]).toHaveValue("2026-07-24");
    expect(screen.getByLabelText(/Observacoes/i)).toHaveValue("Cliente quer encaixe");
    expect(screen.getByText("Corte Feminino")).toBeInTheDocument();
    expect(screen.getByText("Maria Silva")).toBeInTheDocument();
  });
});
