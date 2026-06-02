import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { SystemAdminTenantWhatsAppPage } from "@/pages/system-admin-tenant-whatsapp-page";
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

describe("SystemAdminTenantWhatsAppPage", () => {
  beforeEach(() => {
    authState.user.role = "system-admin";
  });

  test("bloqueia acesso para roles sem permissao", () => {
    authState.user.role = "admin";

    renderWithProviders(<SystemAdminTenantWhatsAppPage />, { withRouter: true });

    expect(screen.getByText("Acesso restrito")).toBeInTheDocument();
  });

  test("seleciona tenant e abre configuracao de whatsapp", async () => {
    const user = userEvent.setup();

    renderWithProviders(<SystemAdminTenantWhatsAppPage />, { withRouter: true });

    expect(screen.getByText("WhatsApp por tenant")).toBeInTheDocument();
    expect(screen.getByTestId("whatsapp-config")).toHaveTextContent("no-tenant");

    await user.selectOptions(screen.getByLabelText("Tenant"), "tenant-2");

    expect(screen.getByTestId("whatsapp-config")).toHaveTextContent("tenant-2");
  });
});
