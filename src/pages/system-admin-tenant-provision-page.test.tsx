import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { SystemAdminTenantProvisionPage } from "@/pages/system-admin-tenant-provision-page";
import { renderWithProviders } from "@/test/render";
import { ApiError } from "@/types/api";

const mutateAsyncMock = vi.fn();
const toastMock = vi.fn();

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

vi.mock("@/hooks/use-provision-tenant-mutation", () => ({
  useProvisionTenantMutation: () => ({
    mutateAsync: mutateAsyncMock,
    isPending: false,
  }),
}));

describe("SystemAdminTenantProvisionPage", () => {
  beforeEach(() => {
    mutateAsyncMock.mockReset();
    toastMock.mockReset();
    authState.user.role = "system-admin";
  });

  test("bloqueia acesso para roles sem permissao", () => {
    authState.user.role = "admin";

    renderWithProviders(<SystemAdminTenantProvisionPage />, { withRouter: true });

    expect(screen.getByText("Acesso restrito")).toBeInTheDocument();
    expect(
      screen.getByText("Voce nao tem permissao para provisionar mandantes.")
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Criar mandante e admin" })
    ).not.toBeInTheDocument();
  });

  test("exibe erros de validacao local", async () => {
    const user = userEvent.setup();

    renderWithProviders(<SystemAdminTenantProvisionPage />, { withRouter: true });

    await user.click(screen.getByRole("button", { name: "Criar mandante e admin" }));

    expect(screen.getByText("Falha no provisionamento")).toBeInTheDocument();
    expect(screen.getByText("Existem campos invalidos. Revise o formulario.")).toBeInTheDocument();
    expect(
      screen.getByText("Informe o nome do mandante com pelo menos 2 caracteres.")
    ).toBeInTheDocument();
    expect(screen.getByText("Slug invalido. Use apenas minusculas, numeros e hifen.")).toBeInTheDocument();
    expect(
      screen.getByText("Informe o nome do administrador com pelo menos 2 caracteres.")
    ).toBeInTheDocument();
    expect(screen.getByText("Email invalido.")).toBeInTheDocument();

    expect(mutateAsyncMock).not.toHaveBeenCalled();
  });

  test("submete payload e renderiza sucesso", async () => {
    const user = userEvent.setup();

    mutateAsyncMock.mockResolvedValue({
      tenant: {
        id: "tenant-new-1",
        name: "Clinica Aurora",
        slug: "clinica-aurora",
      },
      adminUser: {
        id: "user-new-1",
        email: "admin@aurora.com",
      },
      createdAt: "2026-04-11T17:30:00.000Z",
    });

    renderWithProviders(<SystemAdminTenantProvisionPage />, { withRouter: true });

    await user.type(screen.getByLabelText("Nome do mandante"), "Clinica Aurora");
    await user.type(screen.getByLabelText("Identificador (slug)"), "Clínica Aurora");
    await user.type(screen.getByLabelText("Nome do admin inicial"), "Admin Aurora");
    await user.type(screen.getByLabelText("Email do admin inicial"), "ADMIN@AURORA.COM");

    await user.click(screen.getByRole("button", { name: "Criar mandante e admin" }));

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledWith({
        tenant: {
          name: "Clinica Aurora",
          slug: "clinicaaurora",
          timezone: "America/Sao_Paulo",
        },
        adminUser: {
          name: "Admin Aurora",
          email: "admin@aurora.com",
        },
      });
    });

    expect(screen.getByText("Provisionamento concluido")).toBeInTheDocument();
    expect(screen.getByText("tenant-new-1")).toBeInTheDocument();
    expect(screen.getByText("admin@aurora.com")).toBeInTheDocument();

    expect(toastMock).toHaveBeenCalledWith({
      title: "Mandante provisionado",
      description: "Tenant Clinica Aurora criado com sucesso.",
      variant: "success",
    });
  });

  test("mapeia conflito 409 de email para erro de campo", async () => {
    const user = userEvent.setup();

    mutateAsyncMock.mockRejectedValue(
      new ApiError(409, "CONFLICT_DUPLICATE_TENANT_OR_EMAIL", "Ja existe usuario com este email.", "req-1")
    );

    renderWithProviders(<SystemAdminTenantProvisionPage />, { withRouter: true });

    await user.type(screen.getByLabelText("Nome do mandante"), "Clinica Boreal");
    await user.type(screen.getByLabelText("Identificador (slug)"), "clinica-boreal");
    await user.type(screen.getByLabelText("Nome do admin inicial"), "Admin Boreal");
    await user.type(screen.getByLabelText("Email do admin inicial"), "admin@boreal.com");

    await user.click(screen.getByRole("button", { name: "Criar mandante e admin" }));

    expect(await screen.findByText("Falha no provisionamento")).toBeInTheDocument();
    expect(
      screen.getByText("Ja existe usuario com este email.", {
        selector: "#admin-email-error",
      })
    ).toBeInTheDocument();
  });
});
