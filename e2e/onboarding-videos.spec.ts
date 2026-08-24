import { expect, test } from "@playwright/test";

test.use({ video: "on" });

const steps = [
  ["company-data", "Dados da empresa", "/app/settings#public-profile"],
  ["business-hours", "Horario de funcionamento", "/app/settings#business-hours"],
  ["first-professional", "Primeiro profissional", "/app/professionals"],
  ["first-service", "Primeiro servico", "/app/services"],
  ["appearance", "Personalizacao", "/app/settings#public-profile"],
  ["notifications", "Configurar notificacoes", "/app/settings#booking-reminders"],
  ["test-booking", "Fazer agendamento de teste", "/p/maria-teste?onboardingTest=video-demo&service=service-video&date=2026-08-22"],
  ["publish", "Publicar link", "/app/settings#public-link"],
] as const;

const activationResponse = {
  isComplete: false,
  remainingSteps: 8,
  publicUrl: null,
  testBookingUrl: "/p/maria-teste",
  milestones: {
    tenantCreatedAt: "2026-08-21T12:00:00.000Z",
    publishedAt: null,
    firstRealBookingAt: null,
    onboardingCompletedAt: null,
  },
  items: steps.map(([id, label, href]) => ({
    id,
    label,
    status: "PENDING" as const,
    reason: `Conclua ${label.toLowerCase()}.`,
    href,
    videoKey: id,
    completedAt: null,
  })),
};

for (const [videoKey, label] of steps) {
  test(`gera video curto para ${videoKey}`, async ({ page }) => {
    await page.route("http://localhost:3333/onboarding/activation", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(activationResponse) });
    });
    await page.route("http://localhost:3333/**", async (route) => {
      const url = new URL(route.request().url());
      if (url.pathname === "/onboarding/activation") {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(activationResponse) });
        return;
      }
      if (url.pathname === "/onboarding/publish" && route.request().method() === "POST") {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ published: true, publishedAt: "2026-08-21T12:05:00.000Z", publicUrl: "http://localhost:5181/c/tenant-video/catalog" }) });
        return;
      }
      if (url.pathname === "/professionals") {
        if (route.request().method() === "POST") {
          await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ professional: { id: "professional-created", name: "Maria Teste", slug: "maria-teste", description: "Atende com hora marcada.", isActive: true, hasSystemAccess: false, createdAt: "2026-08-21T12:00:00.000Z", updatedAt: "2026-08-21T12:00:00.000Z" } }) });
          return;
        }
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ professionals: [] }) });
        return;
      }
      if (url.pathname === "/auth/me") {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ user: { id: "video-user", name: "Video Teste", email: "video@example.test", role: "admin" }, tenant: { id: "video-tenant", name: "Tenant Video", timezone: "America/Sao_Paulo", slug: "tenant-video", logoUrl: null, coverImageUrl: null, publicAddress: null, description: null, depositModuleEnabled: false, depositPaymentProvider: "MANUAL", depositProviderConfigured: false, mercadoPagoPublicKey: null, depositConvenienceFeeEnabled: false, entitlement: { canAccess: true, accessStatus: "BILLING_EXEMPT", subscriptionStatus: "ACTIVE", trialStartsAt: null, trialEndsAt: null, trialDaysRemaining: null, isBillingExempt: true, billingExemptAt: null, billingExemptReason: null, reason: null } } }) });
        return;
      }
      if (url.pathname === "/services") {
        if (route.request().method() === "POST") {
          await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ service: { id: "service-created", tenantId: "video-tenant", name: "Consulta de demonstracao", description: "Servico pratico.", durationInMinutes: 60, price: 120, isActive: true, createdAt: "2026-08-21T12:00:00.000Z", updatedAt: "2026-08-21T12:00:00.000Z" } }) });
          return;
        }
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ services: [] }) });
        return;
      }
      if (url.pathname === "/tenants/me" && route.request().method() === "PUT") {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ id: "video-tenant", name: "Tenant Video Atualizado", timezone: "America/Sao_Paulo", slug: "tenant-video", logoUrl: null, coverImageUrl: null, publicAddress: "Rua de teste, 100", description: "Agenda de demonstracao", depositModuleEnabled: false, depositPaymentProvider: "MANUAL", depositProviderConfigured: false, mercadoPagoPublicKey: null, depositConvenienceFeeEnabled: false }) });
        return;
      }
      if (url.pathname === "/dashboard/summary") {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ date: "2026-08-21", tenantTimezone: "America/Sao_Paulo", generatedAt: "2026-08-21T12:00:00.000Z", totals: { totalBookings: 0, confirmed: 0, pending: 0, cancelled: 0, completed: 0 }, occupancy: { availableMinutes: 0, bookedMinutes: 0, percentage: 0 }, todayBookings: [], upcomingBookings: [], professionalOccupancy: [] }) });
        return;
      }
      if (url.pathname === "/tenants/me/business-hours") {
        const names = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ businessHours: names.map((dayName, dayOfWeek) => ({ dayOfWeek, dayName, isOpen: dayOfWeek < 5, startTime: "08:00", endTime: "18:00" })) }) });
        return;
      }
      if (url.pathname === "/tenants/me/booking-reminder-settings") {
        if (route.request().method() === "PUT") {
          await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ enabled: true, pushEnabled: true, whatsappEnabled: false, emailEnabled: false, offsets: [24] }) });
          return;
        }
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ enabled: true, pushEnabled: true, whatsappEnabled: false, emailEnabled: false, offsets: [24] }) });
        return;
      }
      if (url.pathname === "/tenants/me/customer-app-settings") {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ customerAppUrl: "http://localhost:5181/c/tenant-video", whatsappMessageTemplate: "Acesse sua agenda: https://example.test/c/tenant-video", whatsappBusinessHint: "Mensagem pronta para compartilhar." }) });
        return;
      }
      if (url.pathname === "/public/professionals/maria-teste") {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ id: "professional-video", name: "Maria Teste", slug: "maria-teste", tenantId: "video-tenant", tenantTimezone: "America/Sao_Paulo", tenantName: "Tenant Video", tenantSlug: "tenant-video", tenantLogoUrl: null, tenantCoverImageUrl: null, tenantCoverThumbnailUrl: null, tenantPublicAddress: "Rua de teste, 100" }) });
        return;
      }
      if (url.pathname === "/public/professionals/maria-teste/services") {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ services: [{ id: "service-video", name: "Consulta de demonstracao", description: "Servico usado no tutorial.", durationInMinutes: 60, imageUrl: null, thumbnailUrl: null, requiresDeposit: false }] }) });
        return;
      }
      if (url.pathname === "/public/professionals/maria-teste/available-dates") {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ tenantTimezone: "America/Sao_Paulo", availableDates: ["2026-08-22"] }) });
        return;
      }
      if (url.pathname === "/public/professionals/maria-teste/slots") {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ tenantTimezone: "America/Sao_Paulo", slots: [{ start: "2026-08-22T13:00:00.000Z", end: "2026-08-22T14:00:00.000Z" }] }) });
        return;
      }
      if (url.pathname === "/public/bookings" && route.request().method() === "POST") {
        await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ id: "booking-video", professionalId: "professional-video", serviceId: "service-video", start: "2026-08-22T13:00:00.000Z", end: "2026-08-22T14:00:00.000Z", status: "CONFIRMED", depositRequired: false, depositStatus: "NOT_REQUIRED", depositAmountCents: null, depositPaymentProvider: "MANUAL", customerName: "Cliente de Teste", customerPhone: "+5511999999999", professionalName: "Maria Teste", serviceName: "Consulta de demonstracao", customerAppBootstrapToken: "bootstrap-video", cancelToken: "cancel-video" }) });
        return;
      }
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });
    });
    await page.goto("/app/dashboard");
    await expect(page.getByTestId("activation-checklist")).toBeVisible();
    const item = page.getByRole("listitem").filter({ hasText: label });
    await expect(item).toBeVisible();
    await item.getByRole("button", { name: "Ver como fazer" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("heading", { name: `Como configurar: ${label}` })).toBeVisible();
    await page.getByRole("dialog").getByRole("button", { name: "Configurar agora" }).click();
    await page.waitForTimeout(1200);
    if (videoKey === "first-professional") {
      await expect(page.getByRole("heading", { name: "Profissionais", exact: true })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Novo profissional" })).toBeVisible();
    } else if (videoKey === "first-service") {
      await expect(page.getByRole("heading", { name: "Servicos", exact: true })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Novo servico" })).toBeVisible();
    } else if (videoKey === "test-booking") {
      await expect(page.getByText("Escolha a data", { exact: true })).toBeVisible();
      await expect(page.getByText(/Serviço selecionado: Consulta de demonstracao/)).toBeVisible();
    } else {
      await expect(page.getByRole("heading", { name: "Configuracoes" })).toBeVisible();
      if (videoKey === "business-hours") await expect(page.getByText("Horário de Funcionamento", { exact: true })).toBeVisible();
      if (videoKey === "notifications") await expect(page.getByText("Lembretes de compromisso", { exact: true })).toBeVisible();
      if (videoKey === "appearance") await expect(page.getByText("Perfil Publico", { exact: true })).toBeVisible();
    }
    if (videoKey === "company-data" || videoKey === "appearance") {
      await page.getByLabel("Nome do estabelecimento").fill(videoKey === "company-data" ? "Studio Video" : "Studio Video Personalizado");
      await page.locator("#geolocation-address-input").fill("Rua dos Tutoriais, 100");
      await page.getByRole("button", { name: "Salvar perfil" }).click();
      await expect(page.getByRole("status")).toContainText("Configuracoes salvas com sucesso");
    } else if (videoKey === "business-hours") {
      await page.locator('input[type="time"]').first().fill("09:00");
      await page.getByRole("button", { name: "Salvar horarios" }).click();
      await expect(page.getByRole("status")).toContainText("Atualizado com sucesso");
    } else if (videoKey === "notifications") {
      await page.locator('input[aria-label="Ativar lembretes de compromisso"]').check();
      await page.getByRole("button", { name: "Salvar lembretes" }).click();
      await expect(page.getByRole("status")).toContainText("Lembretes salvos com sucesso");
    } else if (videoKey === "first-professional") {
      await page.getByLabel("Nome completo").fill("Maria Teste");
      await page.getByLabel("Descricao (opcional)").fill("Atende com hora marcada.");
      await page.getByRole("button", { name: "Criar profissional" }).click();
      await expect(page.getByText("Profissional criado e adicionado na listagem atual.", { exact: true })).toBeVisible();
    } else if (videoKey === "first-service") {
      await page.getByLabel("Nome do servico").fill("Consulta de demonstracao");
      await page.getByLabel("Descricao (opcional)").fill("Servico pratico para o tutorial.");
      await page.getByLabel("Duracao em minutos").fill("60");
      await page.getByLabel("Preço em reais (R$)").fill("12000");
      await page.getByRole("button", { name: "Criar servico" }).click();
      await expect(page.getByText("Servico criado e adicionado na listagem atual.", { exact: true })).toBeVisible();
    } else if (videoKey === "test-booking") {
      await page.getByRole("button", { name: "22", exact: true }).click();
      await page.getByRole("button", { name: "Ver horários" }).click();
      await expect(page.getByText("Horários disponíveis", { exact: true })).toBeVisible();
      await page.getByRole("button", { name: /10:00/ }).click();
      await page.getByRole("button", { name: "Continuar" }).click();
      await page.getByPlaceholder("Seu nome").fill("Cliente de Teste");
      await page.getByPlaceholder("+55 (11) 9xxxx-xxxx").fill("+55 (11) 99999-9999");
      await page.getByRole("button", { name: "Continuar" }).click();
      await expect(page.getByText("Agendamento confirmado!", { exact: true })).toBeVisible();
    } else if (videoKey === "publish") {
      await page.goto("/app/dashboard");
      await expect(page.getByTestId("activation-checklist")).toBeVisible();
      const popupPromise = page.waitForEvent("popup");
      await page.getByRole("listitem").filter({ hasText: "Publicar link" }).getByRole("button", { name: "Publicar link" }).click();
      const popup = await popupPromise;
      await expect(popup).toHaveURL(/\/c\/tenant-video\/catalog/);
      await popup.close();
      await page.goto("/p/maria-teste");
      await expect(page.getByRole("heading", { name: "Maria Teste" })).toBeVisible();
    }
    await page.waitForTimeout(1800);
  });
}
