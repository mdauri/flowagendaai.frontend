import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WhatsAppIntegrationConfig } from "@/components/settings/whatsapp-integration-config";
import { renderWithProviders } from "@/test/render";
import type { SystemAdminTenantMetaWhatsappStatusResponse } from "@/types/system-admin";

const toastMock = vi.fn();
const connectMutateAsyncMock = vi.fn();
const syncMutateAsyncMock = vi.fn();
const testMessageMutateAsyncMock = vi.fn();
const disconnectMutateAsyncMock = vi.fn();

function createStatusResponse(
  overrides: Partial<SystemAdminTenantMetaWhatsappStatusResponse> = {},
): SystemAdminTenantMetaWhatsappStatusResponse {
  return {
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

const queryState = {
  data: createStatusResponse(),
  isLoading: false,
  isError: false,
  error: null,
};

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: toastMock }),
}));

vi.mock("@/hooks/use-system-admin-meta-whatsapp", () => ({
  useSystemAdminMetaWhatsappStatusQuery: () => queryState,
  useConnectSystemAdminMetaWhatsappMutation: () => ({
    mutateAsync: connectMutateAsyncMock,
    isPending: false,
  }),
  useSyncSystemAdminMetaWhatsappMutation: () => ({
    mutateAsync: syncMutateAsyncMock,
    isPending: false,
  }),
  useSendSystemAdminMetaWhatsappTestMessageMutation: () => ({
    mutateAsync: testMessageMutateAsyncMock,
    isPending: false,
  }),
  useDisconnectSystemAdminMetaWhatsappMutation: () => ({
    mutateAsync: disconnectMutateAsyncMock,
    isPending: false,
  }),
}));

describe("WhatsAppIntegrationConfig", () => {
  beforeEach(() => {
    toastMock.mockReset();
    connectMutateAsyncMock.mockReset();
    syncMutateAsyncMock.mockReset();
    testMessageMutateAsyncMock.mockReset();
    disconnectMutateAsyncMock.mockReset();
    queryState.data = createStatusResponse();
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

  it("mostra prompt para selecionar tenant", () => {
    renderWithProviders(<WhatsAppIntegrationConfig tenantId={null} />, {
      withRouter: true,
    });

    expect(screen.getByText("Selecione um tenant")).toBeInTheDocument();
  });

  it("inicia o Embedded Signup e envia o callback ao backend", async () => {
    const user = userEvent.setup();
    connectMutateAsyncMock.mockResolvedValue(undefined);

    renderWithProviders(<WhatsAppIntegrationConfig tenantId="tenant-1" />, {
      withRouter: true,
    });

    await user.click(screen.getByRole("button", { name: /Conectar WhatsApp Business/i }));

    await waitFor(() => {
      expect(connectMutateAsyncMock).toHaveBeenCalledWith({
        code: "code-123",
        phoneNumberId: "123456789",
        wabaId: "987654321",
        businessId: "55555555",
      });
    });
  });

  it("mostra a integracao ativa e permite enviar teste e desconectar", async () => {
    const user = userEvent.setup();
    queryState.data = createStatusResponse({
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
    testMessageMutateAsyncMock.mockResolvedValue({ ok: true });
    disconnectMutateAsyncMock.mockResolvedValue(undefined);

    renderWithProviders(<WhatsAppIntegrationConfig tenantId="tenant-1" />, {
      withRouter: true,
    });

    expect(screen.getByText("Ativo")).toBeInTheDocument();
    expect(screen.getByText("Clinica Demo")).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText("+55 11 99999-9999"), "+55 11 98888-7777");
    await user.click(screen.getByRole("button", { name: /Enviar teste/i }));

    await waitFor(() => {
      expect(testMessageMutateAsyncMock).toHaveBeenCalledWith({
        toPhone: "+55 11 98888-7777",
      });
    });

    await user.click(screen.getByRole("button", { name: "Desconectar" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Confirmar desconexao" }));

    await waitFor(() => {
      expect(disconnectMutateAsyncMock).toHaveBeenCalledTimes(1);
    });
  });
});
