import { useEffect, useState } from "react";
import { AlertTriangle, Loader2, Plus, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/flow/badge";
import { Button } from "@/components/flow/button";
import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import { Input } from "@/components/flow/input";
import { PageState } from "@/components/shared/page-state";
import { SectionHeading } from "@/components/flow/section-heading";
import { Select, type SelectOption } from "@/components/flow/select";
import { SystemAdminGate } from "@/components/system-admin/system-admin-gate";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useSystemAdminTenantsQuery } from "@/hooks/use-system-admin-tenants-query";
import { useMetaWhatsAppBillingSummaryQuery } from "@/hooks/use-meta-whatsapp-billing-summary-query";
import { useMetaWhatsAppBillingEventsQuery } from "@/hooks/use-meta-whatsapp-billing-events-query";
import { useMetaWhatsAppPricingRatesQuery } from "@/hooks/use-meta-whatsapp-pricing-rates-query";
import { useMetaWhatsAppTenantSettingsQuery } from "@/hooks/use-meta-whatsapp-tenant-settings-query";
import { metaWhatsAppBillingService } from "@/services/meta-whatsapp-billing-service";
import type {
  MetaWhatsAppBillingEvent,
  MetaWhatsAppBillingSummaryResponse,
  MetaWhatsAppBillingTenantSummaryResponse,
} from "@/types/meta-whatsapp-billing";
import {
  formatMetaWhatsAppCurrency,
  META_WHATSAPP_BILLING_CURRENCY_OPTIONS,
  normalizeMetaWhatsAppCurrency,
} from "@/lib/meta-whatsapp-currency";

type Scope = "system-admin" | "tenant";
type ViewTab = "overview" | "events" | "pricing" | "policy";
type BillingSummaryResponse =
  | MetaWhatsAppBillingSummaryResponse
  | MetaWhatsAppBillingTenantSummaryResponse;

function hasTopTenant(
  summary: BillingSummaryResponse,
): summary is MetaWhatsAppBillingSummaryResponse {
  return "topTenant" in summary;
}

const CATEGORY_OPTIONS: SelectOption[] = [
  { value: "", label: "Todas as categorias" },
  { value: "service", label: "Service" },
  { value: "marketing", label: "Marketing" },
  { value: "utility", label: "Utility" },
  { value: "authentication", label: "Authentication" },
];

const STATUS_OPTIONS: SelectOption[] = [
  { value: "", label: "Todos os status" },
  { value: "PENDING", label: "Pendente" },
  { value: "PRICED", label: "Precificado" },
  { value: "NEEDS_REVIEW", label: "Em revisao" },
  { value: "IGNORED", label: "Ignorado" },
];

const MARKUP_OPTIONS: SelectOption[] = [
  { value: "NONE", label: "Sem markup" },
  { value: "PERCENTAGE", label: "Percentual" },
  { value: "FIXED", label: "Taxa fixa" },
];

function formatMonthLabel(month: string) {
  const [year, monthPart] = month.split("-");
  return `${monthPart}/${year}`;
}

function getTrendLabel(
  current: MetaWhatsAppBillingSummaryResponse["current"],
  previous: MetaWhatsAppBillingSummaryResponse["previous"],
) {
  if (!previous) return "Sem base anterior";

  const currentCost = Number(current.repassedCost);
  const previousCost = Number(previous.repassedCost);
  if (!previousCost) return "Sem base anterior";

  const delta = ((currentCost - previousCost) / previousCost) * 100;
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta.toFixed(1)}% vs. mês anterior`;
}

function SummaryMetricCard({
  title,
  value,
  description,
  variant = "neutral",
}: {
  title: string;
  value: string;
  description: string;
  variant?: "neutral" | "warning" | "success" | "danger";
}) {
  const badgeVariant =
    variant === "warning"
      ? "warning"
      : variant === "success"
        ? "success"
        : variant === "danger"
          ? "danger"
          : "neutral";

  return (
    <Card variant="glass" padding="md" className="h-full">
      <CardDescription>{title}</CardDescription>
      <CardTitle className="mt-3 break-words text-3xl">{value}</CardTitle>
      <div className="mt-3 flex items-center gap-2">
        <Badge variant={badgeVariant}>{description}</Badge>
      </div>
    </Card>
  );
}

function BillingGraph({
  summary,
}: {
  summary: Pick<
    MetaWhatsAppBillingSummaryResponse,
    "series" | "current" | "previous" | "currency"
  >;
}) {
  const maxValue = Math.max(
    1,
    ...summary.series.map((item) => Number(item.repassedCost)),
  );

  return (
    <Card variant="premium" padding="lg">
      <CardTitle>Evolução mensal</CardTitle>
      <CardDescription className="mt-2">
        Custos repassados acumulados nos últimos meses.
      </CardDescription>
      <div className="mt-6 grid gap-3">
        {summary.series.map((item) => {
          const height = Math.max(
            8,
            Math.round((Number(item.repassedCost) / maxValue) * 100),
          );

          return (
            <div key={item.month} className="grid gap-2">
              <div className="flex items-center justify-between text-sm text-text-soft">
                <span>{formatMonthLabel(item.month)}</span>
                <span>
                  {formatMetaWhatsAppCurrency(item.repassedCost, summary.currency)}
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-[rgba(255,255,255,0.08)]">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${height}%` }}
                  aria-hidden="true"
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function EventsTable({
  currency,
  items,
}: {
  currency: string;
  items: MetaWhatsAppBillingEvent[];
}) {
  return (
    <Card variant="glass" padding="lg">
      <CardTitle>Eventos detalhados</CardTitle>
      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-text-soft">
            <tr className="border-b border-[var(--theme-border-subtle)]">
              <th className="py-3 pr-4">Data</th>
              <th className="py-3 pr-4">Evento</th>
              <th className="py-3 pr-4">Categoria</th>
              <th className="py-3 pr-4">País</th>
              <th className="py-3 pr-4">Telefone</th>
              <th className="py-3 pr-4">Custo</th>
              <th className="py-3 pr-4">Repasse</th>
              <th className="py-3 pr-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td className="py-6 text-text-soft" colSpan={8}>
                  Nenhum evento encontrado para os filtros atuais.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-[var(--theme-border-subtle)]/60"
                >
                  <td className="py-3 pr-4 text-text-soft">
                    {new Date(item.occurredAt).toLocaleString("pt-BR")}
                  </td>
                  <td className="py-3 pr-4 font-semibold text-[var(--theme-text-primary)]">
                    {item.eventType}
                  </td>
                  <td className="py-3 pr-4">{item.messageCategory}</td>
                  <td className="py-3 pr-4">{item.recipientCountry ?? "-"}</td>
                  <td className="py-3 pr-4">{item.recipientPhone ?? "-"}</td>
                  <td className="py-3 pr-4">
                    {formatMetaWhatsAppCurrency(item.estimatedCost, currency)}
                  </td>
                  <td className="py-3 pr-4">
                    {formatMetaWhatsAppCurrency(item.repassedCost, currency)}
                  </td>
                  <td className="py-3 pr-4">
                    <Badge
                      variant={
                        item.billingStatus === "PRICED"
                          ? "success"
                          : item.billingStatus === "NEEDS_REVIEW"
                            ? "warning"
                            : "neutral"
                      }
                    >
                      {item.billingStatus}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function MetaWhatsAppBillingWorkspace({ scope }: { scope: Scope }) {
  const auth = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const tenantsQuery = useSystemAdminTenantsQuery();
  const [activeTab, setActiveTab] = useState<ViewTab>("overview");
  const [selectedTenantId, setSelectedTenantId] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState(() =>
    new Date().toISOString().slice(0, 7),
  );
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [phoneFilter, setPhoneFilter] = useState<string>("");
  const [pricingCountry, setPricingCountry] = useState<string>("");
  const [pricingCategory, setPricingCategory] = useState<string>("");
  const [pricingForm, setPricingForm] = useState({
    countryCode: "BR",
    messageCategory: "service",
    currency: "USD",
    baseCost: "0.0000",
    effectiveFrom: `${new Date().toISOString().slice(0, 10)}T00:00`,
    effectiveTo: "",
  });
  const [settingsForm, setSettingsForm] = useState({
    markupType: "NONE",
    markupValue: "0.0000",
    fixedFeeValue: "0.0000",
    monthlyLimitValue: "0.0000",
    alertThresholdValue: "0.8000",
    currency: "USD",
    isActive: true,
  });

  const effectiveTenantId =
    scope === "tenant" ? (auth.tenant?.id ?? null) : selectedTenantId || null;

  const summaryQuery = useMetaWhatsAppBillingSummaryQuery({
    scope,
    month: selectedMonth,
    tenantId: effectiveTenantId,
  });

  const eventsQuery = useMetaWhatsAppBillingEventsQuery({
    scope,
    month: selectedMonth,
    tenantId: effectiveTenantId,
    category: categoryFilter || null,
    status: statusFilter || null,
    phoneNumberId: phoneFilter || null,
    page: 1,
    pageSize: 20,
  });

  const pricingRatesQuery = useMetaWhatsAppPricingRatesQuery({
    scope,
    countryCode: pricingCountry || undefined,
    messageCategory: pricingCategory || undefined,
    enabled: scope === "system-admin" && activeTab === "pricing",
  });

  const tenantSettingsQuery = useMetaWhatsAppTenantSettingsQuery(
    scope === "system-admin"
      ? {
          scope,
          tenantId: effectiveTenantId,
          enabled: activeTab === "policy" && Boolean(effectiveTenantId),
        }
      : {
          scope,
          tenantId: auth.tenant?.id ?? null,
          enabled: false,
        },
  );

  useEffect(() => {
    if (scope === "tenant" && auth.tenant?.id) {
      setSelectedTenantId(auth.tenant.id);
    }
  }, [auth.tenant?.id, scope]);

  useEffect(() => {
    if (!tenantSettingsQuery.data) {
      return;
    }

    setSettingsForm({
      markupType: tenantSettingsQuery.data.markupType,
      markupValue: tenantSettingsQuery.data.markupValue,
      fixedFeeValue: tenantSettingsQuery.data.fixedFeeValue,
      monthlyLimitValue: tenantSettingsQuery.data.monthlyLimitValue,
      alertThresholdValue: tenantSettingsQuery.data.alertThresholdValue,
      currency: normalizeMetaWhatsAppCurrency(tenantSettingsQuery.data.currency),
      isActive: tenantSettingsQuery.data.isActive,
    });
  }, [tenantSettingsQuery.data]);

  const isSystemAdmin = auth.user?.role === "system-admin";
  const isTenantAdmin = ["admin", "system-admin"].includes(
    auth.user?.role ?? "",
  );
  const tenantOptions: SelectOption[] = (tenantsQuery.data?.items ?? []).map(
    (tenant) => ({
      value: tenant.id,
      label: `${tenant.name} (${tenant.slug})`,
    }),
  );

  const allowedTabs: ViewTab[] =
    scope === "system-admin"
      ? ["overview", "events", "pricing", "policy"]
      : ["overview", "events"];

  if (scope === "system-admin" && !isSystemAdmin) {
    return (
      <PageState
        title="Acesso restrito"
        description="Apenas system-admin pode acompanhar o billing Meta consolidado."
      />
    );
  }

  if (scope === "tenant" && !isTenantAdmin) {
    return (
      <PageState
        title="Acesso restrito"
        description="Apenas admin do tenant pode ver meu consumo WhatsApp."
      />
    );
  }

  if (scope === "tenant" && !auth.tenant) {
    return (
      <PageState title="Carregando" description="Carregando tenant atual..." />
    );
  }

  if (summaryQuery.isLoading || eventsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={24} className="animate-spin text-text-soft" />
      </div>
    );
  }

  if (summaryQuery.isError || eventsQuery.isError) {
    return (
      <PageState
        title="Falha ao carregar billing"
        description="Nao foi possivel carregar os dados de billing Meta agora."
        actionLabel="Tentar novamente"
        onAction={() => {
          void summaryQuery.refetch();
          void eventsQuery.refetch();
        }}
      />
    );
  }

  const summary: BillingSummaryResponse = summaryQuery.data!;
  const events = eventsQuery.data?.items ?? [];
  const topTenant = hasTopTenant(summary) ? summary.topTenant : null;
  const monthLabel = `${selectedMonth.slice(5, 7)}/${selectedMonth.slice(0, 4)}`;
  const alertItem = summary.alerts[0] ?? null;
  const pricingItems = pricingRatesQuery.data?.items ?? [];
  const tenantSettings = tenantSettingsQuery.data ?? null;

  async function handleCreatePricingRate() {
    try {
      await metaWhatsAppBillingService.createPricingRate({
        countryCode: pricingForm.countryCode,
        messageCategory: pricingForm.messageCategory,
        currency: normalizeMetaWhatsAppCurrency(pricingForm.currency),
        baseCost: pricingForm.baseCost,
        effectiveFrom: new Date(pricingForm.effectiveFrom).toISOString(),
        effectiveTo: pricingForm.effectiveTo
          ? new Date(pricingForm.effectiveTo).toISOString()
          : null,
      });
      await queryClient.invalidateQueries({
        queryKey: ["meta-whatsapp-pricing-rates"],
      });
      toast({
        title: "Preço Meta criado",
        description: "A tarifa foi adicionada com sucesso.",
        variant: "success",
      });
    } catch {
      toast({
        title: "Falha ao salvar preço",
        description: "Nao foi possivel gravar a tarifa.",
        variant: "warning",
      });
    }
  }

  async function handleSaveSettings() {
    if (!effectiveTenantId) {
      return;
    }

    try {
      await metaWhatsAppBillingService.saveTenantSettings(effectiveTenantId, {
        markupType: settingsForm.markupType as "NONE" | "PERCENTAGE" | "FIXED",
        markupValue: settingsForm.markupValue,
        fixedFeeValue: settingsForm.fixedFeeValue,
        monthlyLimitValue: settingsForm.monthlyLimitValue,
        alertThresholdValue: settingsForm.alertThresholdValue,
        currency: normalizeMetaWhatsAppCurrency(settingsForm.currency),
        isActive: settingsForm.isActive,
      });
      await queryClient.invalidateQueries({
        queryKey: ["meta-whatsapp-tenant-settings", effectiveTenantId],
      });
      await summaryQuery.refetch();
      toast({
        title: "Política salva",
        description: "A política de cobrança foi atualizada.",
        variant: "success",
      });
    } catch {
      toast({
        title: "Falha ao salvar política",
        description: "Nao foi possivel atualizar a política.",
        variant: "warning",
      });
    }
  }

  async function handleDeletePricingRate(id: string) {
    try {
      await metaWhatsAppBillingService.deletePricingRate(id);
      await queryClient.invalidateQueries({
        queryKey: ["meta-whatsapp-pricing-rates"],
      });
    } catch {
      toast({
        title: "Falha ao remover preço",
        description: "Nao foi possivel excluir a tarifa.",
        variant: "warning",
      });
    }
  }

  return (
    <SystemAdminGate
      isAllowed={scope !== "system-admin" || isSystemAdmin}
      fallbackDescription="Apenas system-admin pode acompanhar o billing consolidado."
    >
      <SectionHeading
        eyebrow={scope === "system-admin" ? "System Admin" : "Tenant Admin"}
        title={
          scope === "system-admin"
            ? "Dashboard Meta API"
            : "Meu consumo WhatsApp"
        }
        description="Controle de custos, eventos auditáveis e política de repasse por tenant."
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <Card variant="premium" padding="lg" className="min-w-0">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_180px]">
            {scope === "system-admin" ? (
              <div className="min-w-0">
                <label className="mb-2 block text-sm font-semibold text-text-soft">
                  Tenant
                </label>
                <Select
                  value={selectedTenantId}
                  options={[
                    { value: "", label: "Visão consolidada" },
                    ...tenantOptions,
                  ]}
                  placeholder="Selecione um tenant"
                  onValueChange={setSelectedTenantId}
                />
              </div>
            ) : null}
            <div className="min-w-0">
              <label className="mb-2 block text-sm font-semibold text-text-soft">
                Mês
              </label>
              <Input
                type="month"
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-1 lg:justify-end">
              {allowedTabs.map((tab) => (
                <Button
                  key={tab}
                  size="sm"
                  variant={activeTab === tab ? "primary" : "secondary"}
                  className="w-full sm:w-auto"
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === "overview"
                    ? "Visão geral"
                    : tab === "events"
                      ? "Eventos"
                      : tab === "pricing"
                        ? "Preços"
                        : "Política"}
                </Button>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {activeTab === "overview" ? (
        <div className="mt-6 space-y-6">
          {alertItem ? (
            <div className="flex items-center gap-3 rounded-2xl border border-[rgba(245,158,11,0.28)] bg-[rgba(245,158,11,0.10)] px-4 py-3 text-sm text-amber-100">
              <AlertTriangle size={16} />
              <span>
                {alertItem.tenantName}: {alertItem.message}
              </span>
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryMetricCard
              title="Custo do mês"
              value={formatMetaWhatsAppCurrency(
                summary.current.repassedCost,
                summary.currency,
              )}
              description={getTrendLabel(summary.current, summary.previous)}
              variant="warning"
            />
            <SummaryMetricCard
              title="Mensagens entregues"
              value={String(summary.current.deliveredCount)}
              description={`${summary.current.totalEvents} eventos`}
              variant="success"
            />
            <SummaryMetricCard
              title="Mensagens gratuitas"
              value={String(summary.current.freeMessagesCount)}
              description="Custo zero aplicado"
            />
            {scope === "system-admin" && (
              <SummaryMetricCard
                title="Maior consumo"
                value={topTenant?.tenantName ?? "—"}
                description={
                  topTenant
                    ? formatMetaWhatsAppCurrency(topTenant.repassedCost, summary.currency)
                    : "Sem dados"
                }
                variant={topTenant?.isNearLimit ? "danger" : "neutral"}
              />
            )}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
            <BillingGraph summary={summary} />
            <Card variant="glass" padding="lg" className="min-w-0">
              <CardTitle>Custo por categoria</CardTitle>
              <div className="mt-6 grid gap-4">
                {summary.byCategory.map((item) => (
                  <div
                    key={item.category}
                    className="rounded-2xl border border-[var(--theme-border-subtle)] bg-[var(--theme-surface-glass)] p-4"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-[var(--theme-text-primary)]">
                        {item.category}
                      </strong>
                      <span className="text-sm text-text-soft">
                        {item.totalEvents} eventos
                      </span>
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-text-soft">
                      <div className="flex items-center justify-between">
                        <span>Custo bruto</span>
                        <span>
                          {formatMetaWhatsAppCurrency(item.grossCost, summary.currency)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Repasse</span>
                        <span>
                          {formatMetaWhatsAppCurrency(item.repassedCost, summary.currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      ) : null}

      {activeTab === "events" ? (
        <div className="mt-6 space-y-6">
          <Card variant="glass" padding="lg" className="min-w-0">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-text-soft">
                  Categoria
                </label>
                <Select
                  value={categoryFilter}
                  options={CATEGORY_OPTIONS}
                  placeholder="Categoria"
                  onValueChange={setCategoryFilter}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-text-soft">
                  Status
                </label>
                <Select
                  value={statusFilter}
                  options={STATUS_OPTIONS}
                  placeholder="Status"
                  onValueChange={setStatusFilter}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-text-soft">
                  Telefone
                </label>
                <Input
                  value={phoneFilter}
                  onChange={(event) => setPhoneFilter(event.target.value)}
                  placeholder="+5511999999999"
                />
              </div>
              <div className="xl:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-end">
                <Button
                  variant="secondary"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    setCategoryFilter("");
                    setStatusFilter("");
                    setPhoneFilter("");
                  }}
                >
                  Limpar filtros
                </Button>
                <Button className="w-full sm:w-auto" onClick={() => void eventsQuery.refetch()}>
                  Atualizar
                </Button>
              </div>
            </div>
          </Card>

          <EventsTable currency={summary.currency} items={events} />
        </div>
      ) : null}

      {activeTab === "pricing" && scope === "system-admin" ? (
        <div className="mt-6 space-y-6">
          <Card variant="glass" padding="lg" className="min-w-0">
            <CardTitle>Tabela de preços Meta</CardTitle>
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-text-soft">
                  País
                </label>
                <Input
                  value={pricingForm.countryCode}
                  onChange={(e) =>
                    setPricingForm((current) => ({
                      ...current,
                      countryCode: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-text-soft">
                  Categoria
                </label>
                <Input
                  value={pricingForm.messageCategory}
                  onChange={(e) =>
                    setPricingForm((current) => ({
                      ...current,
                      messageCategory: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-text-soft">
                  Moeda
                </label>
                <Select
                  value={pricingForm.currency}
                  options={META_WHATSAPP_BILLING_CURRENCY_OPTIONS}
                  onValueChange={(value) =>
                    setPricingForm((current) => ({
                      ...current,
                      currency: normalizeMetaWhatsAppCurrency(value),
                    }))
                  }
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-text-soft">
                  Custo base
                </label>
                <Input
                  value={pricingForm.baseCost}
                  onChange={(e) =>
                    setPricingForm((current) => ({
                      ...current,
                      baseCost: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-text-soft">
                  Vigência início
                </label>
                <Input
                  type="datetime-local"
                  value={pricingForm.effectiveFrom}
                  onChange={(e) =>
                    setPricingForm((current) => ({
                      ...current,
                      effectiveFrom: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-text-soft">
                  Vigência fim
                </label>
                <Input
                  type="datetime-local"
                  value={pricingForm.effectiveTo}
                  onChange={(e) =>
                    setPricingForm((current) => ({
                      ...current,
                      effectiveTo: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="mt-4">
              <Button onClick={() => void handleCreatePricingRate()}>
                <Plus size={16} />
                Criar tarifa
              </Button>
            </div>
          </Card>

          <Card variant="glass" padding="lg" className="min-w-0">
            <CardTitle>Tarifas registradas</CardTitle>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-text-soft">
                  <tr className="border-b border-[var(--theme-border-subtle)]">
                    <th className="py-3 pr-4">País</th>
                    <th className="py-3 pr-4">Categoria</th>
                    <th className="py-3 pr-4">Base</th>
                    <th className="py-3 pr-4">Vigência</th>
                    <th className="py-3 pr-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {pricingItems.length === 0 ? (
                    <tr>
                      <td className="py-5 text-text-soft" colSpan={5}>
                        Nenhuma tarifa cadastrada.
                      </td>
                    </tr>
                  ) : (
                    pricingItems.map((rate) => (
                      <tr
                        key={rate.id}
                        className="border-b border-[var(--theme-border-subtle)]/60"
                      >
                        <td className="py-3 pr-4">{rate.countryCode}</td>
                        <td className="py-3 pr-4">{rate.messageCategory}</td>
                        <td className="py-3 pr-4">
                          {formatMetaWhatsAppCurrency(rate.baseCost, rate.currency)}
                          {rate.isFree ? " (grátis)" : ""}
                        </td>
                        <td className="py-3 pr-4 text-text-soft">
                          {rate.effectiveFrom.slice(0, 10)}{" "}
                          {rate.effectiveTo
                            ? `- ${rate.effectiveTo.slice(0, 10)}`
                            : ""}
                        </td>
                        <td className="py-3 pr-4">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              void handleDeletePricingRate(rate.id)
                            }
                          >
                            <Trash2 size={14} />
                            Excluir
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      ) : null}

      {activeTab === "policy" && scope === "system-admin" ? (
        <div className="mt-6 space-y-6">
          <Card variant="glass" padding="lg">
            <CardTitle>Política de cobrança por tenant</CardTitle>
            {!effectiveTenantId ? (
              <div className="mt-4">
                <PageState
                  title="Selecione um tenant"
                  description="Escolha um tenant para ajustar markup, limite e ativação."
                />
              </div>
            ) : (
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-text-soft">
                    Markup
                  </label>
                  <Select
                    value={settingsForm.markupType}
                    options={MARKUP_OPTIONS}
                    onValueChange={(value) =>
                      setSettingsForm((current) => ({
                        ...current,
                        markupType: value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-text-soft">
                    Markup / taxa
                  </label>
                  <Input
                    value={settingsForm.markupValue}
                    onChange={(event) =>
                      setSettingsForm((current) => ({
                        ...current,
                        markupValue: event.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-text-soft">
                    Taxa fixa
                  </label>
                  <Input
                    value={settingsForm.fixedFeeValue}
                    onChange={(event) =>
                      setSettingsForm((current) => ({
                        ...current,
                        fixedFeeValue: event.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-text-soft">
                    Limite mensal
                  </label>
                  <Input
                    value={settingsForm.monthlyLimitValue}
                    onChange={(event) =>
                      setSettingsForm((current) => ({
                        ...current,
                        monthlyLimitValue: event.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-text-soft">
                    Alerta
                  </label>
                  <Input
                    value={settingsForm.alertThresholdValue}
                    onChange={(event) =>
                      setSettingsForm((current) => ({
                        ...current,
                        alertThresholdValue: event.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-text-soft">
                    Moeda
                  </label>
                  <Select
                    value={settingsForm.currency}
                    options={META_WHATSAPP_BILLING_CURRENCY_OPTIONS}
                    onValueChange={(value) =>
                      setSettingsForm((current) => ({
                        ...current,
                        currency: normalizeMetaWhatsAppCurrency(value),
                      }))
                    }
                  />
                </div>
              </div>
            )}
            {effectiveTenantId ? (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button onClick={() => void handleSaveSettings()}>
                  Salvar política
                </Button>
                {tenantSettings ? (
                  <Badge
                    variant={tenantSettings.isActive ? "success" : "neutral"}
                  >
                    {tenantSettings.isActive ? "Ativa" : "Inativa"}
                  </Badge>
                ) : null}
              </div>
            ) : null}
          </Card>
        </div>
      ) : null}
    </SystemAdminGate>
  );
}

export function MetaWhatsAppBillingSystemAdminPage() {
  return <MetaWhatsAppBillingWorkspace scope="system-admin" />;
}

export function MetaWhatsAppBillingTenantPage() {
  return <MetaWhatsAppBillingWorkspace scope="tenant" />;
}
