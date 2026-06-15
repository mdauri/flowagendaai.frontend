import { screen, waitFor } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CustomerReactivationConfig } from "@/components/settings/customer-reactivation-config";
import { renderWithProviders } from "@/test/render";

const mocks = vi.hoisted(() => ({
  refetchCurrentUserMock: vi.fn(),
  updateTenantMock: vi.fn(),
  sendCustomerReturnReminderTestMock: vi.fn(),
}));

const tenantMock = vi.hoisted(() => ({
  id: "tenant-1",
  name: "Studio Teste",
  timezone: "America/Sao_Paulo",
  slug: "studio-teste",
  logoUrl: null,
  coverImageUrl: null,
  publicAddress: null,
  description: null,
  reactivationEnabled: true,
  daysAfterLastService: 45,
  reactivationCooldownDays: 21,
  reactivationTemplateName: "customer_reactivation_45d",
  depositModuleEnabled: false,
  depositPaymentProvider: "MANUAL",
  depositProviderConfigured: false,
  mercadoPagoPublicKey: null,
  depositConvenienceFeeEnabled: false,
}));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    tenant: tenantMock,
    refetchCurrentUser: mocks.refetchCurrentUserMock,
  }),
}));

vi.mock("@/services/tenant-service", () => ({
  tenantService: {
    updateTenant: mocks.updateTenantMock,
    sendCustomerReturnReminderTest: mocks.sendCustomerReturnReminderTestMock,
  },
}));

describe("CustomerReactivationConfig", () => {
  beforeEach(() => {
    mocks.updateTenantMock.mockReset();
    mocks.refetchCurrentUserMock.mockReset();
    mocks.sendCustomerReturnReminderTestMock.mockReset();
  });

  it("renders current tenant reactivation settings", () => {
    renderWithProviders(<CustomerReactivationConfig />, {
      withRouter: true,
    });

    expect(screen.getByText("Lembrete de retorno automatico")).toBeInTheDocument();
    expect(screen.getByDisplayValue("45")).toBeInTheDocument();
    expect(screen.getByDisplayValue("21")).toBeInTheDocument();
    expect(screen.getByDisplayValue("customer_reactivation_45d")).toBeInTheDocument();
  });

  it("saves the reactivation config using the tenant settings endpoint", async () => {
    mocks.updateTenantMock.mockResolvedValue({
      id: "tenant-1",
      name: "Studio Teste",
      slug: "studio-teste",
      timezone: "America/Sao_Paulo",
      logoUrl: null,
      coverImageUrl: null,
      publicAddress: null,
      description: null,
      reactivationEnabled: false,
      daysAfterLastService: 30,
      reactivationCooldownDays: 30,
      reactivationTemplateName: null,
      depositModuleEnabled: false,
      depositPaymentProvider: "MANUAL",
      depositProviderConfigured: false,
      mercadoPagoPublicKey: null,
      depositConvenienceFeeEnabled: false,
    });

    const user = userEvent.setup();
    renderWithProviders(<CustomerReactivationConfig />, {
      withRouter: true,
    });

    await user.click(screen.getByRole("button", { name: "Salvar automacao" }));

    await waitFor(() => {
      expect(mocks.updateTenantMock).toHaveBeenCalledWith({
        reactivationEnabled: true,
        daysAfterLastService: 45,
        reactivationCooldownDays: 21,
        reactivationTemplateName: "customer_reactivation_45d",
      });
    });

    expect(mocks.refetchCurrentUserMock).toHaveBeenCalled();
  });

  it("sends a test reminder message using the tenant WhatsApp settings", async () => {
    mocks.sendCustomerReturnReminderTestMock.mockResolvedValue({
      status: "SENT",
      metaMessageId: "wamid.test",
    });

    renderWithProviders(<CustomerReactivationConfig />, {
      withRouter: true,
    });

    fireEvent.change(screen.getByLabelText("Nome do cliente"), {
      target: { value: "Joao Teste" },
    });
    fireEvent.change(screen.getByLabelText("Telefone para receber"), {
      target: { value: "+55 11 98888-7777" },
    });
    await waitFor(() => {
      expect(screen.getByDisplayValue("Joao Teste")).toBeInTheDocument();
      expect(screen.getByDisplayValue("+55 11 98888-7777")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: "Enviar teste" }));

    await waitFor(() => {
      expect(mocks.sendCustomerReturnReminderTestMock).toHaveBeenCalledWith({
        customerName: "Joao Teste",
        customerPhone: "+55 11 98888-7777",
      });
    });

    expect(screen.getByText("Teste enviado com sucesso.")).toBeInTheDocument();
  });
});
