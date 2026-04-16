import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { ApiTokensPage } from "@/pages/api-tokens-page";
import { renderWithProviders } from "@/test/render";

const toastMock = vi.fn();
const createMutateAsyncMock = vi.fn();
const revokeMutateAsyncMock = vi.fn();

const authState = {
  user: {
    id: "user-system-admin",
    name: "System Admin",
    email: "sysadmin@agendoro.com",
    role: "system-admin",
  },
  tenant: {
    id: "tenant-platform",
    name: "Agendoro Platform",
    timezone: "America/Sao_Paulo",
    logoUrl: null,
    coverImageUrl: null,
    publicAddress: null,
  },
  isBootstrapping: false,
};

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => authState,
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: toastMock,
  }),
}));

vi.mock("@/hooks/use-system-admin-tenants-query", () => ({
  useSystemAdminTenantsQuery: () => ({
    data: {
      items: [
        { id: "tenant-1", name: "Clinica A", slug: "clinica-a" },
        { id: "tenant-2", name: "Clinica B", slug: "clinica-b" },
      ],
    },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

vi.mock("@/hooks/use-api-tokens-query", () => ({
  useApiTokensQuery: (tenantId: string | null) => ({
    data: tenantId
      ? {
          items: [],
          allowedScopes: ["messages:read"],
        }
      : undefined,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

vi.mock("@/hooks/use-create-api-token-mutation", () => ({
  useCreateApiTokenMutation: () => ({
    mutateAsync: createMutateAsyncMock,
    isPending: false,
  }),
}));

vi.mock("@/hooks/use-revoke-api-token-mutation", () => ({
  useRevokeApiTokenMutation: () => ({
    mutateAsync: revokeMutateAsyncMock,
    isPending: false,
  }),
}));

vi.mock("@/components/flow/select", () => ({
  Select: ({
    id,
    value,
    options,
    placeholder,
    onValueChange,
  }: {
    id?: string;
    value: string;
    options: Array<{ value: string; label: string }>;
    placeholder?: string;
    onValueChange: (value: string) => void;
  }) => (
    <select
      id={id}
      aria-label="Mandante"
      value={value}
      onChange={(event) => onValueChange(event.target.value)}
    >
      <option value="">{placeholder ?? "Selecione"}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));

describe("ApiTokensPage", () => {
  beforeEach(() => {
    toastMock.mockReset();
    createMutateAsyncMock.mockReset();
    revokeMutateAsyncMock.mockReset();
    authState.user.role = "system-admin";
  });

  test("bloqueia acesso para roles sem permissao", () => {
    authState.user.role = "admin";

    renderWithProviders(<ApiTokensPage />, { withRouter: true });

    expect(screen.getByText("Acesso restrito")).toBeInTheDocument();
    expect(
      screen.getByText("Apenas system-admin pode gerenciar tokens M2M.")
    ).toBeInTheDocument();
  });

  test("submete criacao com tenantId selecionado", async () => {
    const user = userEvent.setup();

    createMutateAsyncMock.mockResolvedValue({
      apiToken: {
        id: "token-1",
        name: "Token Integracao",
        prefix: "n8n",
        scopes: ["messages:read"],
        expiresAt: "2026-12-31T00:00:00.000Z",
        createdAt: "2026-04-16T00:00:00.000Z",
        createdBy: "user-system-admin",
      },
      token: "n8n_xpto",
    });

    renderWithProviders(<ApiTokensPage />, { withRouter: true });

    await user.selectOptions(screen.getByLabelText("Mandante"), "tenant-2");
    await user.type(screen.getByLabelText("Nome do token"), "Token Integracao");
    await user.type(screen.getByLabelText("Expira em"), "2026-12-31T12:00");

    await user.click(screen.getByRole("button", { name: "Criar token" }));

    await waitFor(() => {
      expect(createMutateAsyncMock).toHaveBeenCalledTimes(1);
    });

    const payload = createMutateAsyncMock.mock.calls[0][0] as {
      tenantId: string;
      name: string;
      prefix: string;
      scopes: string[];
      expiresAt: string;
    };

    expect(payload.tenantId).toBe("tenant-2");
    expect(payload.name).toBe("Token Integracao");
    expect(payload.prefix).toBe("n8n");
    expect(payload.scopes).toEqual(["messages:read"]);
    expect(typeof payload.expiresAt).toBe("string");
  });
});
