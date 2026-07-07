import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WhatsAppIntegrationConfig } from "@/components/settings/whatsapp-integration-config";
import { renderWithProviders } from "@/test/render";
import { ApiError } from "@/types/api";
import type { SystemAdminTenantMetaWhatsappStatusResponse } from "@/types/system-admin";

const toastMock = vi.fn();
const systemConnectMutateAsyncMock = vi.fn();
const tenantConnectMutateAsyncMock = vi.fn();
const tenantTestMessageMutateAsyncMock = vi.fn();
const tenantDisconnectMutateAsyncMock = vi.fn();
const updateAccessMutateAsyncMock = vi.fn();

function createStatusResponse(
  overrides: Partial<SystemAdminTenantMetaWhatsappStatusResponse> = {},
): SystemAdminTenantMetaWhatsappStatusResponse {
  return {
    enabled: false,
    configured: false,
    status: "not_configured",
    tenantId: "tenant-1",
    provider: null,
    businessId: null,
    businessName: null,
    wabaId: null,
    phoneNumberId: null,
    displayPhoneNumber: null,
    verifiedName: null,
    hasAccessToken: false,
    tokenExpiresAt: null,
    webhookSubscribed: false,
    messagingEnabled: false,
    lastSyncAt: null,
    lastError: null,
    createdAt: null,
    updatedAt: null,
    ...overrides,
  };
}

const systemQueryState = {
  data: createStatusResponse(),
  isLoading: false,
  isError: false,
  error: null,
};

const tenantQueryState = {
  data: createStatusResponse(),
  isLoading: false,
  isError: false,
  error: null,
};

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: toastMock }),
}));

vi.mock("@/hooks/use-system-admin-meta-whatsapp", () => ({
  useSystemAdminMetaWhatsappStatusQuery: () => systemQueryState,
  useConnectSystemAdminMetaWhatsappMutation: () => ({
    mutateAsync: systemConnectMutateAsyncMock,
    isPending: false,
  }),
  useSyncSystemAdminMetaWhatsappMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useSendSystemAdminMetaWhatsappTestMessageMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useDisconnectSystemAdminMetaWhatsappMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useUpdateSystemAdminMetaWhatsappAccessMutation: () => ({
    mutateAsync: updateAccessMutateAsyncMock,
    isPending: false,
  }),
}));

vi.mock("@/hooks/use-tenant-meta-whatsapp", () => ({
  useTenantMetaWhatsappStatusQuery: () => tenantQueryState,
  useConnectTenantMetaWhatsappMutation: () => ({
    mutateAsync: tenantConnectMutateAsyncMock,
    isPending: false,
  }),
  useSyncTenantMetaWhatsappMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useSendTenantMetaWhatsappTestMessageMutation: () => ({
    mutateAsync: tenantTestMessageMutateAsyncMock,
    isPending: false,
  }),
  useDisconnectTenantMetaWhatsappMutation: () => ({
    mutateAsync: tenantDisconnectMutateAsyncMock,
    isPending: false,
  }),
}));

describe("WhatsAppIntegrationConfig", () => {
  beforeEach(() => {
    toastMock.mockReset();
    systemConnectMutateAsyncMock.mockReset();
    tenantConnectMutateAsyncMock.mockReset();
    tenantTestMessageMutateAsyncMock.mockReset();
    tenantDisconnectMutateAsyncMock.mockReset();
    updateAccessMutateAsyncMock.mockReset();
    systemQueryState.data = createStatusResponse();
    tenantQueryState.data = createStatusResponse();
    import.meta.env.VITE_META_APP_ID = "meta-app-id";
    import.meta.env.VITE_META_WHATSAPP_CONFIGURATION_ID = "config-123";
    window.FB = {
      login: (callback) =>
        callback({
          authResponse: { code: "code-123" },
          phone_number_id: "123456789",
          waba_id: "987654321",
          business_id: "55555555",
        }),
    };
  });

  it("mostra prompt para selecionar tenant no system-admin", () => {
    renderWithProviders(<WhatsAppIntegrationConfig tenantId={null} />, {
      withRouter: true,
    });

    expect(screen.getByText("Selecione um tenant")).toBeInTheDocument();
  });

  it("permite liberar o tenant no system-admin", async () => {
    const user = userEvent.setup();
    updateAccessMutateAsyncMock.mockResolvedValue({
      tenantId: "tenant-1",
      enabled: true,
      updatedAt: "2026-07-06T10:00:00.000Z",
    });

    renderWithProviders(<WhatsAppIntegrationConfig tenantId="tenant-1" />, {
      withRouter: true,
    });

    await user.click(screen.getByRole("button", { name: /Liberar WhatsApp/i }));

    await waitFor(() => {
      expect(updateAccessMutateAsyncMock).toHaveBeenCalledWith({
        enabled: true,
      });
    });
  });

  it("mostra estado bloqueado no tenant", () => {
    tenantQueryState.data = createStatusResponse({
      enabled: false,
      configured: false,
      status: "not_configured",
    });

    renderWithProviders(
      <WhatsAppIntegrationConfig scope="tenant" tenantId="tenant-1" />,
      {
        withRouter: true,
      },
    );

    expect(screen.getByText("WhatsApp indisponivel")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Conectar WhatsApp Business/i }),
    ).toBeDisabled();
  });

  it("inicia o Embedded Signup no tenant", async () => {
    const user = userEvent.setup();
    tenantQueryState.data = createStatusResponse({
      enabled: true,
      configured: false,
      status: "not_configured",
    });
    tenantConnectMutateAsyncMock.mockResolvedValue(undefined);

    renderWithProviders(
      <WhatsAppIntegrationConfig scope="tenant" tenantId="tenant-1" />,
      {
        withRouter: true,
      },
    );

    await user.click(
      screen.getByRole("button", { name: /Conectar WhatsApp Business/i }),
    );

    await waitFor(() => {
      expect(tenantConnectMutateAsyncMock).toHaveBeenCalledWith({
        code: "code-123",
        phoneNumberId: "123456789",
        wabaId: "987654321",
        businessId: "55555555",
      });
    });
  });

  it("mostra orientacao detalhada quando a Meta falha na conexao do tenant", async () => {
    const user = userEvent.setup();
    tenantQueryState.data = createStatusResponse({
      enabled: true,
      configured: false,
      status: "not_configured",
    });
    tenantConnectMutateAsyncMock.mockRejectedValue(
      new ApiError(
        400,
        "INVALID_INPUT",
        "Invalid verification code format",
        "req-123",
        {
          stage: "exchange_code",
          operatorHint:
            "Refaca o fluxo no Embedded Signup da Meta e confirme se o code nao expirou.",
        },
      ),
    );

    renderWithProviders(
      <WhatsAppIntegrationConfig scope="tenant" tenantId="tenant-1" />,
      {
        withRouter: true,
      },
    );

    await user.click(
      screen.getByRole("button", { name: /Conectar WhatsApp Business/i }),
    );

    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Falha ao conectar",
          description:
            "Falha na etapa exchange_code. Invalid verification code format Refaca o fluxo no Embedded Signup da Meta e confirme se o code nao expirou. RequestId: req-123.",
          variant: "danger",
        }),
      );
    });
  });

  it("mostra a integracao ativa no tenant e permite enviar teste e desconectar", async () => {
    const user = userEvent.setup();
    tenantQueryState.data = createStatusResponse({
      enabled: true,
      configured: true,
      status: "active",
      provider: "meta",
      businessId: "55555555",
      businessName: "Clinica Demo",
      wabaId: "987654321",
      phoneNumberId: "123456789",
      displayPhoneNumber: "+55 11 99999-9999",
      verifiedName: "Clinica Demo",
      hasAccessToken: true,
      webhookSubscribed: true,
      messagingEnabled: true,
      lastSyncAt: "2026-07-01T15:00:00.000Z",
      createdAt: "2026-07-01T14:00:00.000Z",
      updatedAt: "2026-07-01T15:00:00.000Z",
    });
    tenantTestMessageMutateAsyncMock.mockResolvedValue({ ok: true });
    tenantDisconnectMutateAsyncMock.mockResolvedValue(undefined);

    renderWithProviders(
      <WhatsAppIntegrationConfig scope="tenant" tenantId="tenant-1" />,
      {
        withRouter: true,
      },
    );

    expect(screen.getByText("Ativo")).toBeInTheDocument();
    expect(screen.getByText("Clinica Demo")).toBeInTheDocument();
    expect(screen.getByText("Atualizar dados")).toBeInTheDocument();

    await user.type(
      screen.getByPlaceholderText("+55 11 99999-9999"),
      "+55 11 98888-7777",
    );
    await user.click(screen.getByRole("button", { name: /Enviar teste/i }));

    await waitFor(() => {
      expect(tenantTestMessageMutateAsyncMock).toHaveBeenCalledWith({
        toPhone: "+55 11 98888-7777",
      });
    });

    await user.click(screen.getByRole("button", { name: "Desconectar" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Confirmar desconexao" }));

    await waitFor(() => {
      expect(tenantDisconnectMutateAsyncMock).toHaveBeenCalledTimes(1);
    });
  });
});
