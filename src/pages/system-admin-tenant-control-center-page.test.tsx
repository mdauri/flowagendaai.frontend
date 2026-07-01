import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { SystemAdminTenantControlCenterPage } from "@/pages/system-admin-tenant-control-center-page";
import { renderWithProviders } from "@/test/render";

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

vi.mock("@/components/settings/whatsapp-integration-config", () => ({
  WhatsAppIntegrationConfig: ({ tenantId }: { tenantId: string | null }) => (
    <div data-testid="whatsapp-config">{tenantId ?? "no-tenant"}</div>
  ),
}));

vi.mock("@/components/system-admin/api-tokens-panel", () => ({
  ApiTokensPanel: ({
    tenantId,
    onDirtyChange,
  }: {
    tenantId: string | null;
    onDirtyChange?: (dirty: boolean) => void;
  }) => (
    <div data-testid="api-tokens-panel">
      <span>{tenantId ?? "no-tenant"}</span>
      <button type="button" onClick={() => onDirtyChange?.(true)}>
        Marcar alterado
      </button>
    </div>
  ),
}));

vi.mock("@/components/system-admin/subscription-club-panel", () => ({
  SubscriptionClubPanel: ({ tenantId }: { tenantId: string | null }) => (
    <div data-testid="subscription-club-panel">{tenantId ?? "no-tenant"}</div>
  ),
}));

vi.mock("@/components/system-admin/tenant-order-settings-panel", () => ({
  TenantOrderSettingsPanel: ({ tenantId }: { tenantId: string | null }) => (
    <div data-testid="tenant-order-settings-panel">{tenantId ?? "no-tenant"}</div>
  ),
}));

vi.mock("@/components/system-admin/tenant-deposit-fee-panel", () => ({
  TenantDepositFeePanel: ({ tenantId }: { tenantId: string | null }) => (
    <div data-testid="deposit-fee-panel">{tenantId ?? "no-tenant"}</div>
  ),
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
      aria-label="Tenant"
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

describe("SystemAdminTenantControlCenterPage", () => {
  beforeEach(() => {
    authState.user.role = "system-admin";
    vi.restoreAllMocks();
  });

  test("bloqueia acesso para roles sem permissao", () => {
    authState.user.role = "admin";

    renderWithProviders(<SystemAdminTenantControlCenterPage />, {
      withRouter: true,
    });

    expect(screen.getByText("Acesso restrito")).toBeInTheDocument();
  });

  test("seleciona tenant e alterna entre modulos na mesma tela", async () => {
    const user = userEvent.setup();

    renderWithProviders(<SystemAdminTenantControlCenterPage />, {
      withRouter: true,
    });

    expect(screen.getByText("Central do tenant")).toBeInTheDocument();
    expect(screen.getByTestId("whatsapp-config")).toHaveTextContent("no-tenant");

    await user.selectOptions(screen.getByLabelText("Tenant"), "tenant-2");

    expect(screen.getByTestId("whatsapp-config")).toHaveTextContent("tenant-2");
    expect(screen.getByText("Clinica B")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "API Tokens" }));
    expect(screen.getByTestId("api-tokens-panel")).toHaveTextContent("tenant-2");

    await user.click(screen.getByRole("tab", { name: "Clube" }));
    expect(screen.getByTestId("subscription-club-panel")).toHaveTextContent("tenant-2");

    await user.click(screen.getByRole("tab", { name: "Sinal Online" }));
    expect(screen.getByTestId("deposit-fee-panel")).toHaveTextContent("tenant-2");

    await user.click(screen.getByRole("tab", { name: "Pedidos" }));
    expect(screen.getByTestId("tenant-order-settings-panel")).toHaveTextContent("tenant-2");
  });

  test("pede confirmacao antes de trocar de modulo com alteracoes nao salvas", async () => {
    const user = userEvent.setup();

    renderWithProviders(<SystemAdminTenantControlCenterPage />, {
      withRouter: true,
      route: "/?tab=api-tokens",
    });

    await user.selectOptions(screen.getByLabelText("Tenant"), "tenant-2");
    await user.click(screen.getByRole("button", { name: "Marcar alterado" }));
    await user.click(screen.getByRole("tab", { name: "Clube" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Descartar alteracoes?")).toBeInTheDocument();
    expect(screen.getByTestId("api-tokens-panel")).toBeInTheDocument();
    expect(
      screen.queryByTestId("subscription-club-panel"),
    ).not.toBeInTheDocument();
  });
});
