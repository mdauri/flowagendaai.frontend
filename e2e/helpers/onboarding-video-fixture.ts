import type { Page } from "@playwright/test";

const steps = [
  ["company-data", "Dados da empresa", "/app/settings#public-profile"],
  ["business-hours", "Horario de funcionamento", "/app/settings#business-hours"],
  ["first-professional", "Primeiro profissional", "/app/professionals"],
  ["first-service", "Primeiro servico", "/app/services"],
  ["appearance", "Personalizacao", "/app/settings#public-profile"],
  ["notifications", "Configurar notificacoes", "/app/settings#booking-reminders"],
  ["test-booking", "Fazer agendamento de teste", "/app/dashboard?onboarding=test"],
  ["publish", "Publicar link", "/app/settings#public-link"],
] as const;

export const videoSteps = steps;

export async function mockOnboardingVideoApi(page: Page) {
  let professionalCreated = false;
  let serviceCreated = false;
  await page.route("http://localhost:3333/**", async (route) => {
    const url = new URL(route.request().url());
    const method = route.request().method();
    const json = (body: unknown, status = 200) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
    const activation = {
      isComplete: false,
      remainingSteps: 8,
      publicUrl: null,
      testBookingUrl: "/p/maria-teste",
      milestones: { tenantCreatedAt: "2026-08-21T12:00:00.000Z", publishedAt: null, firstRealBookingAt: null, onboardingCompletedAt: null },
      metrics: { timeToFirstRealBookingMs: null, timeToPublishMs: null, publishToFirstBookingMs: null },
      items: steps.map(([videoKey, label, href]) => ({ id: videoKey.replaceAll("-", "_"), label, status: "PENDING", reason: `Conclua ${label.toLowerCase()}.`, href, videoKey, completedAt: null })),
    };
    if (url.pathname === "/onboarding/activation") return json(activation);
    if (url.pathname === "/onboarding/publish" && method === "POST") return json({ published: true, publishedAt: "2026-08-21T12:05:00.000Z", publicUrl: "http://localhost:5181/c/tenant-video/catalog" });
    if (url.pathname === "/onboarding/test-session" && method === "POST") return json({ token: "video-demo-token", expiresAt: "2026-08-21T12:35:00.000Z", publicUrl: "http://localhost:5181/c/tenant-video/catalog", bookingUrl: "/p/maria-teste" }, 201);
    if (url.pathname === "/auth/me") return json({ user: { id: "video-user", name: "Video Teste", email: "video@example.test", role: "admin" }, tenant: { id: "video-tenant", name: "Tenant Video", timezone: "America/Sao_Paulo", slug: "tenant-video", logoUrl: null, coverImageUrl: null, publicAddress: "Rua de teste, 100", description: "Agenda de demonstracao", depositModuleEnabled: false, depositPaymentProvider: "MANUAL", depositProviderConfigured: false, mercadoPagoPublicKey: null, depositConvenienceFeeEnabled: false, entitlement: { canAccess: true, accessStatus: "BILLING_EXEMPT", subscriptionStatus: "ACTIVE", isBillingExempt: true } } });
    if (url.pathname === "/professionals" && method === "GET") return json({ professionals: professionalCreated ? [{ id: "professional-created", name: "Maria Demo", slug: "maria-teste", description: "Atende com hora marcada.", isActive: true }] : [] });
    if (url.pathname === "/professionals" && method === "POST") { professionalCreated = true; return json({ professional: { id: "professional-created", name: "Maria Demo", slug: "maria-teste", description: "Atende com hora marcada.", isActive: true } }, 201); }
    if (url.pathname === "/services" && method === "GET") return json({ services: serviceCreated ? [{ id: "service-created", tenantId: "video-tenant", name: "Consulta de demonstracao", description: "Servico pratico.", durationInMinutes: 60, price: 120, isActive: true }] : [] });
    if (url.pathname === "/services" && method === "POST") { serviceCreated = true; return json({ service: { id: "service-created", tenantId: "video-tenant", name: "Consulta de demonstracao", description: "Servico pratico.", durationInMinutes: 60, price: 120, isActive: true } }, 201); }
    if (url.pathname === "/tenants/me" && method === "PUT") return json({ id: "video-tenant", name: "Studio Video", timezone: "America/Sao_Paulo", slug: "tenant-video", publicAddress: "Rua dos Tutoriais, 100", description: "Agenda de demonstracao" });
    if (url.pathname === "/dashboard/summary") return json({ date: "2026-08-21", tenantTimezone: "America/Sao_Paulo", generatedAt: "2026-08-21T12:00:00.000Z", totals: { totalBookings: 0, confirmed: 0, pending: 0, cancelled: 0, completed: 0 }, occupancy: { availableMinutes: 0, bookedMinutes: 0, percentage: 0 }, todayBookings: [], upcomingBookings: [], professionalOccupancy: [] });
    if (url.pathname === "/tenants/me/business-hours") return json({ businessHours: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((dayName, dayOfWeek) => ({ dayOfWeek, dayName, isOpen: dayOfWeek < 5, startTime: "08:00", endTime: "18:00" })) });
    if (url.pathname === "/tenants/me/booking-reminder-settings") return json({ enabled: true, pushEnabled: true, whatsappEnabled: false, emailEnabled: false, offsets: [24] });
    if (url.pathname === "/tenants/me/customer-app-settings") return json({ customerAppUrl: "http://localhost:5181/c/tenant-video", whatsappMessageTemplate: "Acesse sua agenda: https://example.test/c/tenant-video", whatsappBusinessHint: "Mensagem pronta para compartilhar." });
    if (url.pathname === "/public/professionals/maria-teste") return json({ id: "professional-video", name: "Maria Demo", slug: "maria-teste", tenantId: "video-tenant", tenantTimezone: "America/Sao_Paulo", tenantName: "Tenant Video", tenantSlug: "tenant-video", tenantPublicAddress: "Rua de teste, 100" });
    if (url.pathname === "/public/professionals/maria-teste/services") return json({ services: [{ id: "service-video", name: "Consulta de demonstracao", description: "Servico usado no tutorial.", durationInMinutes: 60, requiresDeposit: false }] });
    if (url.pathname === "/public/professionals/maria-teste/available-dates") return json({ tenantTimezone: "America/Sao_Paulo", availableDates: ["2026-08-25"] });
    if (url.pathname === "/public/professionals/maria-teste/slots") return json({ tenantTimezone: "America/Sao_Paulo", slots: [{ start: "2026-08-25T13:00:00.000Z", end: "2026-08-25T14:00:00.000Z" }] });
    if (url.pathname === "/public/bookings" && method === "POST") return json({ id: "booking-video", professionalId: "professional-video", serviceId: "service-video", start: "2026-08-25T13:00:00.000Z", end: "2026-08-25T14:00:00.000Z", status: "CONFIRMED", depositRequired: false, depositStatus: "NOT_REQUIRED", customerName: "Cliente de Teste", customerPhone: "+5511999999999", professionalName: "Maria Demo", serviceName: "Consulta de demonstracao", customerAppBootstrapToken: "bootstrap-video", cancelToken: "cancel-video" });
    return json({});
  });
}
