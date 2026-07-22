import { screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SettingsPage } from "@/pages/settings-page";
import { renderWithProviders } from "@/test/render";

const mockRefetchCurrentUser = vi.fn();
type MockAuthState = {
  user:
    | { id: string; name: string; email: string; role: string; professionalId: null }
    | null;
  tenant:
    | {
        id: string;
        name: string;
        timezone: string;
        logoUrl: string;
        coverImageUrl: null;
        publicAddress: null;
        description: null;
        reactivationEnabled: boolean;
        daysAfterLastService: number;
        reactivationCooldownDays: number;
        reactivationTemplateName: null;
        bookingReminderEnabled: boolean;
        bookingReminderWhatsappEnabled: boolean;
        bookingReminderEmailEnabled: boolean;
        bookingReminderOffsets: number[];
        depositModuleEnabled: boolean;
        depositPaymentProvider: string;
        depositProviderConfigured: boolean;
        mercadoPagoPublicKey: null;
        depositConvenienceFeeEnabled: boolean;
      }
    | null;
  isBootstrapping: boolean;
  refetchCurrentUser: typeof mockRefetchCurrentUser;
};

const mockAuthState: MockAuthState = {
  user: { id: "user-1", name: "Admin", email: "admin@test.com", role: "admin", professionalId: null },
  tenant: {
    id: "tenant-1",
    name: "Test Studio",
    timezone: "America/Sao_Paulo",
    logoUrl: "https://example.com/logo.png",
    coverImageUrl: null,
    publicAddress: null,
    description: null,
    reactivationEnabled: false,
    daysAfterLastService: 30,
    reactivationCooldownDays: 30,
    reactivationTemplateName: null,
    bookingReminderEnabled: true,
    bookingReminderWhatsappEnabled: true,
    bookingReminderEmailEnabled: false,
    bookingReminderOffsets: [24],
    depositModuleEnabled: false,
    depositPaymentProvider: "MANUAL",
    depositProviderConfigured: false,
    mercadoPagoPublicKey: null,
    depositConvenienceFeeEnabled: false,
  },
  isBootstrapping: false,
  refetchCurrentUser: mockRefetchCurrentUser,
};

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => mockAuthState,
}));

vi.mock("@/services/tenant-service", () => ({
  tenantService: {
    updateTenant: vi.fn(),
    geocode: vi.fn(),
    getCustomerAppSettings: vi.fn(),
    getBookingReminderSettings: vi.fn(),
    updateBookingReminderSettings: vi.fn(),
    sendBookingReminderTestEmail: vi.fn(),
  },
}));

vi.mock("@/services/tenant-cover-image-service", () => ({
  tenantCoverImageService: {
    getUploadUrl: vi.fn(),
    confirmUpload: vi.fn(),
    removeCoverImage: vi.fn(),
  },
}));

vi.mock("@/services/tenant-logo-image-service", () => ({
  tenantLogoImageService: {
    getUploadUrl: vi.fn(),
    confirmUpload: vi.fn(),
    removeLogo: vi.fn(),
  },
}));

import { tenantService } from "@/services/tenant-service";
import { tenantLogoImageService } from "@/services/tenant-logo-image-service";

describe("SettingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthState.user = {
      id: "user-1",
      name: "Admin",
      email: "admin@test.com",
      role: "admin",
      professionalId: null,
    };
    mockAuthState.tenant = {
      id: "tenant-1",
      name: "Test Studio",
      timezone: "America/Sao_Paulo",
      logoUrl: "https://example.com/logo.png",
      coverImageUrl: null,
      publicAddress: null,
      description: null,
      reactivationEnabled: false,
      daysAfterLastService: 30,
      reactivationCooldownDays: 30,
      reactivationTemplateName: null,
      bookingReminderEnabled: true,
      bookingReminderWhatsappEnabled: true,
      bookingReminderEmailEnabled: false,
      bookingReminderOffsets: [24],
      depositModuleEnabled: false,
      depositPaymentProvider: "MANUAL",
      depositProviderConfigured: false,
      mercadoPagoPublicKey: null,
      depositConvenienceFeeEnabled: false,
    };
    mockAuthState.isBootstrapping = false;
    mockAuthState.refetchCurrentUser = mockRefetchCurrentUser;
    vi.mocked(tenantService.getBookingReminderSettings).mockResolvedValue({
      enabled: true,
      pushEnabled: false,
      whatsappEnabled: true,
      emailEnabled: false,
      offsets: [24],
    });
    vi.mocked(tenantService.getCustomerAppSettings).mockResolvedValue({
      tenantSlug: "test-studio",
      customerAppUrl: "http://localhost:5173/c/test-studio",
      whatsappMessageTemplate: "Mensagem de teste",
      whatsappBusinessHint: "Cole no WhatsApp Business.",
    });
  });

  it("renders tenant profile section with current data", () => {
    renderWithProviders(<SettingsPage />, {
      route: "/app/settings",
      withRouter: true,
    });

    expect(screen.getByText("Configuracoes")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test Studio")).toBeInTheDocument();
    expect(screen.getByText("Perfil Publico")).toBeInTheDocument();
  });

  it("renders booking reminder settings section", async () => {
    renderWithProviders(<SettingsPage />, {
      route: "/app/settings",
      withRouter: true,
    });

    expect(await screen.findByText("Lembretes de compromisso")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Salvar lembretes" })).toBeInTheDocument();
  });

  it("renders customer app settings section", async () => {
    renderWithProviders(<SettingsPage />, {
      route: "/app/settings",
      withRouter: true,
    });

    expect(await screen.findByText("App do cliente")).toBeInTheDocument();
    expect(await screen.findByDisplayValue("http://localhost:5173/c/test-studio")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copiar link" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copiar mensagem" })).toBeInTheDocument();
  });

  it("save button calls PATCH /tenants/me with updated values", async () => {
    vi.mocked(tenantService.updateTenant).mockResolvedValue({
      id: "tenant-1",
      name: "Updated Studio",
      slug: "updated-studio",
      timezone: "America/Sao_Paulo",
      logoUrl: "https://example.com/logo.png",
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
    renderWithProviders(<SettingsPage />, {
      route: "/app/settings",
      withRouter: true,
    });

    // Change the name
    const nameInput = screen.getByDisplayValue("Test Studio");
    await user.clear(nameInput);
    await user.type(nameInput, "Updated Studio");
    
    // Verify input was updated
    expect(screen.getByDisplayValue("Updated Studio")).toBeInTheDocument();

    // Click save
    const saveButton = screen.getByRole("button", { name: "Salvar perfil" });
    await user.click(saveButton);

    await waitFor(() => {
      expect(tenantService.updateTenant).toHaveBeenCalledWith({
        name: "Updated Studio",
        publicAddress: null,
        coverImageUrl: null,
        logoUrl: "https://example.com/logo.png",
      });
    });
  });

  it("displays success message on save", async () => {
    vi.mocked(tenantService.updateTenant).mockResolvedValue({
      id: "tenant-1",
      name: "Test Studio",
      slug: "test-studio",
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

    renderWithProviders(<SettingsPage />, {
      route: "/app/settings",
      withRouter: true,
    });

    const saveButton = screen.getByRole("button", { name: "Salvar perfil" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Configuracoes salvas com sucesso/i)
      ).toBeInTheDocument();
    });
  });

  it("displays error message on save failure", async () => {
    vi.mocked(tenantService.updateTenant).mockRejectedValue(
      new Error("Network error")
    );

    renderWithProviders(<SettingsPage />, {
      route: "/app/settings",
      withRouter: true,
    });

    const saveButton = screen.getByRole("button", { name: "Salvar perfil" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });
  });

  it("loading state displays during save", async () => {
    vi.mocked(tenantService.updateTenant).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                id: "tenant-1",
                name: "Test Studio",
                slug: "test-studio",
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
              }),
            100
          )
        )
    );

    renderWithProviders(<SettingsPage />, {
      route: "/app/settings",
      withRouter: true,
    });

    const saveButton = screen.getByRole("button", { name: "Salvar perfil" });
    fireEvent.click(saveButton);

    // Should show "Salvando..." text
    await waitFor(() => {
      expect(screen.getByText(/Salvando\.\.\./i)).toBeInTheDocument();
    });
  });

  it("shows loading state when bootstrapping", () => {
    mockAuthState.user = null;
    mockAuthState.tenant = null;
    mockAuthState.isBootstrapping = true;

    renderWithProviders(<SettingsPage />, {
      route: "/app/settings",
      withRouter: true,
    });

    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
    expect(screen.queryByText("Configuracoes")).not.toBeInTheDocument();
  });

  it("public address input is rendered", () => {
    renderWithProviders(<SettingsPage />, {
      route: "/app/settings",
      withRouter: true,
    });

    expect(screen.getByRole("textbox", { name: /Endereco/i })).toBeInTheDocument();
  });

  it("cover image upload section is rendered", () => {
    renderWithProviders(<SettingsPage />, {
      route: "/app/settings",
      withRouter: true,
    });

    expect(screen.getByText("Imagem de Capa")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Enviar capa/i })
    ).toBeInTheDocument();
  });

  it("logo upload section is rendered", () => {
    renderWithProviders(<SettingsPage />, {
      route: "/app/settings",
      withRouter: true,
    });

    expect(screen.getByText("Logo")).toBeInTheDocument();
    // The mock tenant has logoUrl, so it shows success state with Replace button
    expect(
      screen.getByRole("button", { name: "Trocar logo" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Remover logo" })
    ).toBeInTheDocument();
  });

  it("customer reactivation section is rendered", () => {
    renderWithProviders(<SettingsPage />, {
      route: "/app/settings",
      withRouter: true,
    });

    expect(screen.getByText("Lembrete de retorno automatico")).toBeInTheDocument();
    expect(
      screen.getAllByRole("checkbox", { name: "Ativar lembrete de retorno automático" })[0]
    ).toBeInTheDocument();
  });

  it("logo upload complete updates state", async () => {
    vi.mocked(tenantLogoImageService.getUploadUrl).mockResolvedValue({
      uploadUrl: "https://s3.example.com/upload",
      objectKey: "tenant-1/tenants/tenant-1/logo/uuid.png",
    });

    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", mockFetch);

    vi.mocked(tenantLogoImageService.confirmUpload).mockResolvedValue({
      logoUrl: "https://example.com/new-logo.png",
    });

    renderWithProviders(<SettingsPage />, {
      route: "/app/settings",
      withRouter: true,
    });

    const file = new File(["content"], "logo.png", { type: "image/png" });
    const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    // Find the first file input (logo upload)
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fireEvent.change(fileInputs[0], { target: { files: [file] } });

    await waitFor(() => {
      expect(tenantLogoImageService.getUploadUrl).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(tenantLogoImageService.confirmUpload).toHaveBeenCalled();
    });
  });

  it("logo remove calls DELETE endpoint", async () => {
    vi.mocked(tenantLogoImageService.removeLogo).mockResolvedValue({
      logoUrl: null,
    });

    const user = userEvent.setup();
    renderWithProviders(<SettingsPage />, {
      route: "/app/settings",
      withRouter: true,
    });

    // First, we need to have a logo. The mock tenant has logoUrl set.
    // Click the upload button area to trigger file input - actually we need to simulate
    // a completed upload first. Since the tenant already has logoUrl, the LogoUpload
    // component should show the success state with remove button.
    // But the component uses local state initialized from tenant.logoUrl.
    // Let's check if the remove button is present.
    const removeButton = screen.getByRole("button", { name: "Remover logo" });
    await user.click(removeButton);

    await waitFor(() => {
      expect(tenantLogoImageService.removeLogo).toHaveBeenCalled();
    });
  });

  it("logo remove error is displayed", async () => {
    vi.mocked(tenantLogoImageService.removeLogo).mockRejectedValue(
      new Error("Remove failed")
    );

    const user = userEvent.setup();
    renderWithProviders(<SettingsPage />, {
      route: "/app/settings",
      withRouter: true,
    });

    const removeButton = screen.getByRole("button", { name: "Remover logo" });
    await user.click(removeButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Nao foi possivel remover a logo/i)
      ).toBeInTheDocument();
    });
  });
});
