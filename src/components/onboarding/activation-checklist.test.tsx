import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ActivationChecklist } from "./activation-checklist";

const activation = {
  visibility: "VISIBLE" as const,
  isComplete: false,
  remainingSteps: 8,
  publicUrl: null,
  testBookingUrl: "/p/maria-teste",
  milestones: { tenantCreatedAt: "2026-08-21T12:00:00.000Z", publishedAt: null, firstRealBookingAt: null, onboardingCompletedAt: null },
  metrics: { timeToFirstRealBookingMs: null, timeToPublishMs: null, publishToFirstBookingMs: null },
  items: Array.from({ length: 8 }, (_, index) => ({ id: `step-${index}`, label: `Etapa ${index + 1}`, status: "PENDING" as const, reason: "Ainda falta configurar.", href: "/app/settings", videoKey: `step-${index}`, completedAt: null })),
};

const mockedOnboardingService = vi.hoisted(() => ({
  getActivation: vi.fn(),
  setVisibility: vi.fn(),
  createTestSession: vi.fn(),
  publish: vi.fn(),
}));

mockedOnboardingService.getActivation.mockResolvedValue(activation);
vi.mock("@/services/onboarding-service", () => ({ onboardingService: mockedOnboardingService }));

describe("ActivationChecklist", () => {
  it("exibe progresso, motivos e CTA sem bloquear o dashboard", async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(<QueryClientProvider client={client}><ActivationChecklist onNavigate={vi.fn()} /></QueryClientProvider>);
    expect(await screen.findByTestId("activation-checklist")).toBeInTheDocument();
    expect(screen.getByText(/8 passos/)).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Ver como fazer" })).toHaveLength(8);
  });

  it("fecha o video com Escape e devolve foco ao acionador", async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const user = userEvent.setup();
    render(<QueryClientProvider client={client}><ActivationChecklist onNavigate={vi.fn()} /></QueryClientProvider>);
    const trigger = (await screen.findAllByRole("button", { name: "Ver como fazer" }))[0];
    await user.click(trigger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Fechar video" })).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("confirma ocultacao incompleta e persiste a preferencia", async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const user = userEvent.setup();
    mockedOnboardingService.setVisibility.mockResolvedValue({ visibility: "DISMISSED", changed: true });
    render(<QueryClientProvider client={client}><ActivationChecklist onNavigate={vi.fn()} /></QueryClientProvider>);

    const hideButton = await screen.findByRole("button", { name: "Ocultar configuração inicial" });
    await user.click(hideButton);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/Ainda existem etapas de configuração pendentes/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Ocultar checklist" }));

    expect(mockedOnboardingService.setVisibility).toHaveBeenCalledWith("DISMISSED");
  });
});
