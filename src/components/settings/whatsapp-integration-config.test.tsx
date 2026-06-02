import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WhatsAppIntegrationConfig } from "@/components/settings/whatsapp-integration-config";
import { renderWithProviders } from "@/test/render";
import { ApiError } from "@/types/api";

const toastMock = vi.fn();
const mutateAsyncMock = vi.fn();

const queryState = {
  data: undefined as
    | {
        id: string;
        displayName: string | null;
        displayPhone: string | null;
        phoneNumberId: string;
        wabaId: string | null;
        status: string;
        isActive: boolean;
        accessTokenMasked: string | null;
        hasAccessToken: boolean;
        webhookUrl: string;
        n8nWebhookUrl: string | null;
        n8nEnabled: boolean;
        createdAt: string;
        updatedAt: string;
      }
    | undefined,
  error: null as ApiError | null,
  isLoading: false,
  isError: false,
};

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: toastMock }),
}));

vi.mock("@/hooks/use-tenant-whatsapp-query", () => ({
  useTenantWhatsappQuery: (tenantId: string | null) => ({
    ...queryState,
    enabledTenantId: tenantId,
  }),
}));

vi.mock("@/hooks/use-save-tenant-whatsapp-mutation", () => ({
  useSaveTenantWhatsappMutation: () => ({
    mutateAsync: mutateAsyncMock,
    isPending: false,
  }),
}));

describe("WhatsAppIntegrationConfig", () => {
  beforeEach(() => {
    toastMock.mockReset();
    mutateAsyncMock.mockReset();
    queryState.data = undefined;
    queryState.error = null;
    queryState.isLoading = false;
    queryState.isError = false;
  });

  it("mostra prompt para selecionar tenant", () => {
    renderWithProviders(<WhatsAppIntegrationConfig tenantId={null} />, {
      withRouter: true,
    });

    expect(screen.getByText("Selecione um tenant")).toBeInTheDocument();
  });

  it("submete a criacao com os campos obrigatorios", async () => {
    const user = userEvent.setup();
    queryState.error = new ApiError(404, "NOT_FOUND", "Configuracao nao encontrada.", "req-1");
    queryState.isError = true;
    mutateAsyncMock.mockResolvedValue({
      id: "whatsapp-1",
      displayName: "Agendoro Test",
      displayPhone: "+55 12 99999-9999",
      phoneNumberId: "123456789",
      wabaId: "987654321",
      status: "connected",
      isActive: true,
      accessTokenMasked: "********1234",
      hasAccessToken: true,
      webhookUrl: "http://localhost:3333/webhooks/meta/whatsapp",
      n8nWebhookUrl: null,
      n8nEnabled: false,
      createdAt: "2026-06-02T00:00:00.000Z",
      updatedAt: "2026-06-02T00:00:00.000Z",
    });

    renderWithProviders(<WhatsAppIntegrationConfig tenantId="tenant-1" />, {
      withRouter: true,
    });

    await user.click(screen.getByRole("button", { name: "Configurar WhatsApp" }));
    await user.type(screen.getByLabelText("Nome de exibicao"), "Agendoro Test");
    await user.type(screen.getByLabelText("Numero WhatsApp"), "+55 12 99999-9999");
    await user.type(screen.getByLabelText("Phone Number ID"), "123456789");
    await user.type(screen.getByLabelText("WABA ID"), "987654321");
    await user.type(screen.getByLabelText("Token de acesso da Meta"), "EAAXXXXX");

    await user.click(screen.getByRole("button", { name: "Configurar WhatsApp" }));

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledTimes(1);
    });

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      tenantId: "tenant-1",
      displayName: "Agendoro Test",
      displayPhone: "+55 12 99999-9999",
      phoneNumberId: "123456789",
      wabaId: "987654321",
      accessToken: "EAAXXXXX",
      n8nEnabled: false,
      isActive: true,
      n8nWebhookUrl: null,
    });
  });

  it("exibe a configuracao existente e permite copiar o webhook", async () => {
    const user = userEvent.setup();
    queryState.data = {
      id: "whatsapp-1",
      displayName: "Agendoro Test",
      displayPhone: "+55 12 99999-9999",
      phoneNumberId: "123456789",
      wabaId: "987654321",
      status: "connected",
      isActive: true,
      accessTokenMasked: "********1234",
      hasAccessToken: true,
      webhookUrl: "http://localhost:3333/webhooks/meta/whatsapp",
      n8nWebhookUrl: null,
      n8nEnabled: false,
      createdAt: "2026-06-02T00:00:00.000Z",
      updatedAt: "2026-06-02T00:00:00.000Z",
    };

    const clipboardWriteMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(window.navigator, "clipboard", {
      value: { writeText: clipboardWriteMock },
      configurable: true,
    });

    renderWithProviders(<WhatsAppIntegrationConfig tenantId="tenant-1" />, {
      withRouter: true,
    });

    expect(screen.getByText("Conectado")).toBeInTheDocument();
    expect(screen.getByText("********1234")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Copiar webhook" }));

    await waitFor(() => {
      expect(clipboardWriteMock).toHaveBeenCalledWith("http://localhost:3333/webhooks/meta/whatsapp");
    });
  });
});
