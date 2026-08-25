import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import { ActivationChecklist } from "./activation-checklist";

const activation = {
  isComplete: false,
  remainingSteps: 8,
  publicUrl: null,
  testBookingUrl: "/p/maria-teste",
  milestones: { tenantCreatedAt: "2026-08-21T12:00:00.000Z", publishedAt: null, firstRealBookingAt: null, onboardingCompletedAt: null },
  metrics: { timeToFirstRealBookingMs: null, timeToPublishMs: null, publishToFirstBookingMs: null },
  items: [
    ["company_data", "Dados da empresa"],
    ["business_hours", "Horários"],
    ["first_professional", "Primeiro profissional"],
    ["first_service", "Primeiro serviço"],
    ["appearance", "Personalização"],
    ["notifications", "Notificações"],
    ["test_booking", "Agendamento de teste"],
    ["publish", "Publicar link"],
  ].map(([id, label]) => ({ id, label, status: "PENDING" as const, reason: "Ainda falta configurar.", href: "/app/settings", videoKey: id, completedAt: null })),
};

const mockedOnboardingService = vi.hoisted(() => ({
  getActivation: vi.fn(),
  createTestSession: vi.fn(),
  publish: vi.fn(),
}));

mockedOnboardingService.getActivation.mockResolvedValue(activation);
vi.mock("@/services/onboarding-service", () => ({ onboardingService: mockedOnboardingService }));

describe("ActivationChecklist", () => {
  it("exibe progresso, motivos e CTA sem bloquear o dashboard", async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(<MemoryRouter><QueryClientProvider client={client}><ActivationChecklist onNavigate={vi.fn()} /></QueryClientProvider></MemoryRouter>);
    expect(await screen.findByTestId("activation-checklist")).toBeInTheDocument();
    expect(screen.getByText(/8 passos/)).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Ver como fazer" })).toHaveLength(8);
    expect(screen.getAllByRole("link", { name: "Ver ajuda" })).toHaveLength(8);
    expect(screen.getAllByRole("link", { name: /^Ver ajuda$/ })[0]).toHaveAttribute("href", "/ajuda/primeiros-passos/configurar-empresa");
  });

  it("fecha o video com Escape e devolve foco ao acionador", async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const user = userEvent.setup();
    render(<MemoryRouter><QueryClientProvider client={client}><ActivationChecklist onNavigate={vi.fn()} /></QueryClientProvider></MemoryRouter>);
    const trigger = (await screen.findAllByRole("button", { name: "Ver como fazer" }))[0];
    await user.click(trigger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Fechar video" })).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
