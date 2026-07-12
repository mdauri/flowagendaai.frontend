import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BookingReminderConfig } from "@/components/settings/booking-reminder-config";
import { renderWithProviders } from "@/test/render";

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    tenant: { id: "tenant-1" },
  }),
}));

vi.mock("@/services/tenant-service", () => ({
  tenantService: {
    getBookingReminderSettings: vi.fn(),
    updateBookingReminderSettings: vi.fn(),
  },
}));

import { tenantService } from "@/services/tenant-service";

function getCheckboxButton(name: string) {
  return screen
    .getAllByRole("checkbox", { name })
    .find((element) => element.tagName === "BUTTON") as HTMLElement;
}

describe("BookingReminderConfig", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(tenantService.getBookingReminderSettings).mockResolvedValue({
      enabled: false,
      whatsappEnabled: true,
      emailEnabled: false,
      offsets: [24],
    });
  });

  it("renders settings loaded from the API", async () => {
    renderWithProviders(<BookingReminderConfig />);

    expect(await screen.findByText("Lembretes de compromisso")).toBeInTheDocument();
    await waitFor(() => {
      expect(getCheckboxButton("Ativar lembretes de compromisso")).toHaveAttribute(
        "aria-disabled",
        "false",
      );
    });
    expect(getCheckboxButton("Ativar lembretes de compromisso")).toHaveAttribute("aria-checked", "false");
  });

  it("shows validation error when enabled without offsets", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BookingReminderConfig />);

    await screen.findByText("Lembretes de compromisso");
    await waitFor(() => {
      expect(getCheckboxButton("Ativar lembretes de compromisso")).toHaveAttribute(
        "aria-disabled",
        "false",
      );
    });

    await user.click(getCheckboxButton("Ativar lembretes de compromisso"));
    await user.click(getCheckboxButton("24 horas antes"));
    await user.click(screen.getByRole("button", { name: "Salvar lembretes" }));

    expect(
      screen.getByText("Selecione pelo menos um intervalo para ativar os lembretes."),
    ).toBeInTheDocument();
  });

  it("saves the selected settings", async () => {
    vi.mocked(tenantService.updateBookingReminderSettings).mockResolvedValue({
      enabled: true,
      whatsappEnabled: true,
      emailEnabled: true,
      offsets: [24, 12],
    });

    const user = userEvent.setup();
    renderWithProviders(<BookingReminderConfig />);

    await screen.findByText("Lembretes de compromisso");
    await waitFor(() => {
      expect(getCheckboxButton("Ativar lembretes de compromisso")).toHaveAttribute(
        "aria-disabled",
        "false",
      );
    });

    await user.click(getCheckboxButton("Ativar lembretes de compromisso"));
    await user.click(getCheckboxButton("12 horas antes"));
    await user.click(getCheckboxButton("E-mail"));
    await user.click(screen.getByRole("button", { name: "Salvar lembretes" }));

    await waitFor(() => {
      expect(tenantService.updateBookingReminderSettings).toHaveBeenCalledWith({
        enabled: true,
        whatsappEnabled: true,
        emailEnabled: true,
        offsets: [24, 12],
      });
    });
  });
});
