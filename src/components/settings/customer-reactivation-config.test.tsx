import { fireEvent, screen, waitFor } from "@testing-library/react";
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
  reactivationPushEnabled: false as boolean | undefined,
  reactivationWhatsappEnabled: true as boolean | undefined,
  reactivationEmailEnabled: false as boolean | undefined,
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

function renderComponent() {
  return renderWithProviders(<CustomerReactivationConfig />, {
    withRouter: true,
  });
}

function getVisualCheckbox(name: string) {
  return screen.getAllByRole("checkbox", { name })[0];
}

describe("CustomerReactivationConfig", () => {
  beforeEach(() => {
    mocks.updateTenantMock.mockReset();
    mocks.refetchCurrentUserMock.mockReset();
    mocks.sendCustomerReturnReminderTestMock.mockReset();
    tenantMock.reactivationEnabled = true;
    tenantMock.reactivationPushEnabled = false;
    tenantMock.reactivationWhatsappEnabled = true;
    tenantMock.reactivationEmailEnabled = false;
    tenantMock.reactivationTemplateName = "customer_reactivation_45d";
  });

  it("renders the multichannel settings in economic priority order", () => {
    renderComponent();

    expect(screen.getByText("Lembrete de retorno automático")).toBeInTheDocument();
    expect(screen.getByText("Recomendado")).toBeInTheDocument();
    const channelNames = [
      screen.getByText("Push Notification"),
      screen.getByText("WhatsApp", { selector: "label" }),
      screen.getByText("E-mail", { selector: "label" }),
    ];
    expect(channelNames[0].compareDocumentPosition(channelNames[1]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(channelNames[1].compareDocumentPosition(channelNames[2]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByDisplayValue("45")).toBeInTheDocument();
    expect(screen.getByDisplayValue("21")).toBeInTheDocument();
    expect(screen.getByDisplayValue("customer_reactivation_45d")).toBeInTheDocument();
  });

  it("uses WhatsApp-only defaults for a legacy tenant", () => {
    tenantMock.reactivationPushEnabled = undefined;
    tenantMock.reactivationWhatsappEnabled = undefined;
    tenantMock.reactivationEmailEnabled = undefined;

    renderComponent();

    expect(getVisualCheckbox("Ativar canal Push")).toHaveAttribute("aria-checked", "false");
    expect(getVisualCheckbox("Ativar canal WhatsApp")).toHaveAttribute("aria-checked", "true");
    expect(getVisualCheckbox("Ativar canal E-mail")).toHaveAttribute("aria-checked", "false");
  });

  it("saves Push as the only enabled channel", async () => {
    mocks.updateTenantMock.mockResolvedValue({});
    const user = userEvent.setup();
    renderComponent();

    await user.click(getVisualCheckbox("Ativar canal Push"));
    await user.click(getVisualCheckbox("Ativar canal WhatsApp"));
    await user.click(screen.getByRole("button", { name: "Salvar automação" }));

    await waitFor(() => {
      expect(mocks.updateTenantMock).toHaveBeenCalledWith({
        reactivationEnabled: true,
        daysAfterLastService: 45,
        reactivationCooldownDays: 21,
        reactivationTemplateName: "customer_reactivation_45d",
        reactivationPushEnabled: true,
        reactivationWhatsappEnabled: false,
        reactivationEmailEnabled: false,
      });
    });
    expect(mocks.refetchCurrentUserMock).toHaveBeenCalled();
  });

  it("saves E-mail as the only enabled channel without requiring WhatsApp template", async () => {
    mocks.updateTenantMock.mockResolvedValue({});
    const user = userEvent.setup();
    renderComponent();

    await user.click(getVisualCheckbox("Ativar canal E-mail"));
    await user.click(getVisualCheckbox("Ativar canal WhatsApp"));
    await user.click(screen.getByRole("button", { name: "Salvar automação" }));

    await waitFor(() => {
      expect(mocks.updateTenantMock).toHaveBeenCalledWith({
        reactivationEnabled: true,
        daysAfterLastService: 45,
        reactivationCooldownDays: 21,
        reactivationTemplateName: "customer_reactivation_45d",
        reactivationPushEnabled: false,
        reactivationWhatsappEnabled: false,
        reactivationEmailEnabled: true,
      });
    });
  });

  it("disables controls and prevents a second submit while saving", async () => {
    let resolveSave: (() => void) | undefined;
    mocks.updateTenantMock.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveSave = resolve;
        }),
    );
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByRole("button", { name: "Salvar automação" }));

    const savingButton = screen.getByRole("button", { name: "Salvando..." });
    expect(savingButton).toHaveAttribute("aria-busy", "true");
    expect(savingButton).toBeDisabled();
    expect(getVisualCheckbox("Ativar canal WhatsApp")).toBeDisabled();
    expect(mocks.updateTenantMock).toHaveBeenCalledTimes(1);

    fireEvent.click(savingButton);
    expect(mocks.updateTenantMock).toHaveBeenCalledTimes(1);

    resolveSave?.();
    expect(
      await screen.findByRole("status"),
    ).toHaveTextContent("Automação salva.");
  });

  it("shows success feedback and refreshes the authenticated tenant", async () => {
    mocks.updateTenantMock.mockResolvedValue({});
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByRole("button", { name: "Salvar automação" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Automação salva.",
    );
    expect(mocks.refetchCurrentUserMock).toHaveBeenCalledTimes(1);
  });

  it("blocks an active automation without channels", async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(getVisualCheckbox("Ativar canal WhatsApp"));
    await user.click(screen.getByRole("button", { name: "Salvar automação" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Selecione pelo menos um canal.");
    expect(mocks.updateTenantMock).not.toHaveBeenCalled();
  });

  it("requires a template only while WhatsApp is active", async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.clear(screen.getByLabelText("Nome do template WhatsApp"));
    await user.click(screen.getByRole("button", { name: "Salvar automação" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Informe o template do WhatsApp.");
    expect(mocks.updateTenantMock).not.toHaveBeenCalled();
  });

  it("preserves the template when WhatsApp is hidden and re-enabled", async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(getVisualCheckbox("Ativar canal WhatsApp"));
    expect(screen.queryByLabelText("Nome do template WhatsApp")).not.toBeInTheDocument();
    expect(screen.queryByText("Teste do WhatsApp")).not.toBeInTheDocument();

    await user.click(getVisualCheckbox("Ativar canal WhatsApp"));
    expect(screen.getByDisplayValue("customer_reactivation_45d")).toBeInTheDocument();
    expect(screen.getByText("Teste do WhatsApp")).toBeInTheDocument();
  });

  it("keeps Save available while disabling the automation", async () => {
    mocks.updateTenantMock.mockResolvedValue({});
    const user = userEvent.setup();
    renderComponent();

    await user.click(
      getVisualCheckbox("Ativar lembrete de retorno automático"),
    );

    expect(getVisualCheckbox("Ativar canal WhatsApp")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Salvar automação" })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "Salvar automação" }));
    await waitFor(() => {
      expect(mocks.updateTenantMock).toHaveBeenCalledWith(
        expect.objectContaining({ reactivationEnabled: false }),
      );
    });
  });

  it("shows API errors without clearing the form", async () => {
    mocks.updateTenantMock.mockRejectedValue(new Error("Falha segura."));
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByRole("button", { name: "Salvar automação" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Falha segura.");
    expect(screen.getByDisplayValue("customer_reactivation_45d")).toBeInTheDocument();
  });

  it("sends the existing test through WhatsApp", async () => {
    mocks.sendCustomerReturnReminderTestMock.mockResolvedValue({
      status: "SENT",
      metaMessageId: "wamid.test",
    });
    renderComponent();

    fireEvent.change(screen.getByLabelText("Nome do cliente"), {
      target: { value: "Joao Teste" },
    });
    fireEvent.change(screen.getByLabelText("Telefone"), {
      target: { value: "+55 11 98888-7777" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enviar teste" }));

    await waitFor(() => {
      expect(mocks.sendCustomerReturnReminderTestMock).toHaveBeenCalledWith({
        customerName: "Joao Teste",
        customerPhone: "+55 11 98888-7777",
      });
    });
    expect(screen.getByText("Mensagem de teste enviada.")).toBeInTheDocument();
  });
});
