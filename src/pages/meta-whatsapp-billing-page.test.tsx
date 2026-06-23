import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  MetaWhatsAppBillingSystemAdminPage,
} from "@/pages/meta-whatsapp-billing-page";
import { renderWithProviders } from "@/test/render";

const authState = {
  user: {
    id: "user-system-admin",
    name: "System Admin",
    email: "sysadmin@agendoro.com",
    role: "system-admin",
  },
  tenant: {
    id: "tenant-platform",
    name: "Agendoro Platform",
    timezone: "America/Sao_Paulo",
    slug: "platform",
    logoUrl: null,
    coverImageUrl: null,
    publicAddress: null,
  },
  isBootstrapping: false,
};

const summaryResponse = {
  generatedAt: "2026-06-03T12:00:00.000Z",
  month: "2026-06",
  currency: "USD",
  series: [
    {
      month: "2026-06",
      totalEvents: 2,
      grossCost: "1.2345",
      repassedCost: "2.3456",
    },
  ],
  current: {
    totalEvents: 2,
    messagesReceived: 1,
    messagesSent: 1,
    deliveredCount: 1,
    failedCount: 0,
    freeMessagesCount: 0,
    grossCost: "1.2345",
    repassedCost: "2.3456",
    billingMonth: "2026-06-01T00:00:00.000Z",
    timezone: "America/Sao_Paulo",
  },
  previous: null,
  byCategory: [
    {
      category: "service",
      totalEvents: 2,
      grossCost: "1.2345",
      repassedCost: "2.3456",
    },
  ],
  byTenant: [
    {
      tenantId: "tenant-1",
      tenantName: "Tenant 1",
      totalEvents: 2,
      grossCost: "1.2345",
      repassedCost: "2.3456",
      monthlyLimitValue: "100.0000",
      alertThresholdValue: "0.8000",
      usagePercentage: 0.023456,
      isNearLimit: false,
    },
  ],
  topTenant: {
    tenantId: "tenant-1",
    tenantName: "Tenant 1",
    totalEvents: 2,
    grossCost: "1.2345",
    repassedCost: "2.3456",
    monthlyLimitValue: "100.0000",
    alertThresholdValue: "0.8000",
    usagePercentage: 0.023456,
    isNearLimit: false,
  },
  alerts: [],
};

const eventsResponse = {
  total: 1,
  page: 1,
  pageSize: 20,
  items: [
    {
      id: "event-1",
      tenantId: "tenant-1",
      wabaId: "waba-1",
      phoneNumberId: "phone-1",
      recipientPhone: "5511999999999",
      messageId: "wamid-1",
      eventType: "MESSAGE_RECEIVED",
      messageCategory: "service",
      recipientCountry: "BR",
      pricingCurrency: "USD",
      pricingRateId: "rate-1",
      pricingVersion: "v1",
      estimatedCost: "1.2345",
      repassedCost: "2.3456",
      isFree: false,
      billingStatus: "PRICED",
      sourceEventId: "source-1",
      occurredAt: "2026-06-03T12:00:00.000Z",
      createdAt: "2026-06-03T12:00:00.000Z",
      updatedAt: "2026-06-03T12:00:00.000Z",
    },
  ],
};

const auditResponse = {
  total: 2,
  page: 1,
  pageSize: 20,
  items: [
    {
      id: "audit-1",
      tenantId: "tenant-1",
      conversationId: "conv-1",
      phoneNumberId: "phone-1",
      customerPhone: "5511999999999",
      contactName: "Cliente Teste",
      direction: "INBOUND",
      messageType: "text",
      metaMessageId: "wamid-in-1",
      metaTimestamp: "2026-06-03T11:00:00.000Z",
      textBody: "Quero agendar",
      status: "RECEIVED",
      statusUpdatedAt: "2026-06-03T11:00:00.000Z",
      createdAt: "2026-06-03T11:00:00.000Z",
      updatedAt: "2026-06-03T11:00:00.000Z",
    },
    {
      id: "audit-2",
      tenantId: "tenant-1",
      conversationId: "conv-1",
      phoneNumberId: "phone-1",
      customerPhone: "5511999999999",
      contactName: "Cliente Teste",
      direction: "OUTBOUND",
      messageType: "template",
      metaMessageId: "wamid-out-1",
      metaTimestamp: "2026-06-03T12:00:00.000Z",
      textBody: "booking_reminder",
      status: "SENT",
      statusUpdatedAt: "2026-06-03T12:00:00.000Z",
      createdAt: "2026-06-03T12:00:00.000Z",
      updatedAt: "2026-06-03T12:00:00.000Z",
    },
  ],
};

const pricingRatesResponse = {
  items: [
    {
      id: "rate-1",
      countryCode: "US",
      messageCategory: "service",
      currency: "USD",
      baseCost: "1.2345",
      isFree: false,
      effectiveFrom: "2026-06-01T00:00:00.000Z",
      effectiveTo: null,
      source: null,
      externalReference: null,
      createdAt: "2026-06-01T00:00:00.000Z",
      updatedAt: "2026-06-01T00:00:00.000Z",
    },
  ],
};

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => authState,
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock("@/hooks/use-system-admin-tenants-query", () => ({
  useSystemAdminTenantsQuery: () => ({
    data: {
      items: [
        { id: "tenant-1", name: "Tenant 1", slug: "tenant-1" },
      ],
    },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

vi.mock("@/hooks/use-meta-whatsapp-billing-summary-query", () => ({
  useMetaWhatsAppBillingSummaryQuery: () => ({
    data: summaryResponse,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

vi.mock("@/hooks/use-meta-whatsapp-billing-events-query", () => ({
  useMetaWhatsAppBillingEventsQuery: () => ({
    data: eventsResponse,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

vi.mock("@/hooks/use-meta-whatsapp-audit-query", () => ({
  useMetaWhatsAppAuditQuery: () => ({
    data: auditResponse,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

vi.mock("@/hooks/use-meta-whatsapp-pricing-rates-query", () => ({
  useMetaWhatsAppPricingRatesQuery: () => ({
    data: pricingRatesResponse,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

vi.mock("@/hooks/use-meta-whatsapp-tenant-settings-query", () => ({
  useMetaWhatsAppTenantSettingsQuery: () => ({
    data: null,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

vi.mock("@/components/system-admin/system-admin-gate", () => ({
  SystemAdminGate: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

describe("MetaWhatsAppBillingSystemAdminPage", () => {
  beforeEach(() => {
    authState.user.role = "system-admin";
  });

  it("mostra valores Meta com 4 casas decimais nos grids detalhados", async () => {
    const user = userEvent.setup();

    renderWithProviders(<MetaWhatsAppBillingSystemAdminPage />);

    expect(screen.getAllByText(/US\$\s?2,3456/).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Custos" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Auditoria" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Auditoria" }));
    expect(screen.getByText("Auditoria de mensagens")).toBeInTheDocument();
    expect(screen.getByText("INBOUND")).toBeInTheDocument();
    expect(screen.getByText("OUTBOUND")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Custos" }));
    const eventCostMatches = screen.getAllByText(/US\$\s?1,2345/);
    expect(eventCostMatches.length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: "Preços" }));
    expect(screen.getAllByText(/US\$\s?1,2345/).length).toBeGreaterThan(0);
  });
});
