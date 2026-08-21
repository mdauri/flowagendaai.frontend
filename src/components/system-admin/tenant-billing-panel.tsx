import { Loader2 } from "lucide-react";
import { CardDescription, CardTitle } from "@/components/flow/card";
import { PageState } from "@/components/shared/page-state";
import {
  useSystemAdminTenantBillingQuery,
  useSystemAdminOneTimePurchasesQuery,
  useUpdateOneTimePurchaseSetupStatusMutation,
  useUpdateSystemAdminTenantBillingCustomerMutation,
} from "@/hooks/use-billing-query";
import { BillingCustomerForm } from "@/components/billing/billing-customer-form";
import { PaymentStatusBadge, SubscriptionStatusBadge } from "@/components/billing/billing-status-badge";
import { ApiError } from "@/types/api";
import type { BillingCustomerInput } from "@/types/billing";
import type { OneTimePurchaseSetupStatus } from "@/types/billing";

interface TenantBillingPanelProps {
  tenantId: string | null;
}

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Nao foi possivel carregar o billing.";
}

function setupStatusLabel(status: OneTimePurchaseSetupStatus) {
  return {
    NOT_STARTED: "Pendente de configuracao",
    IN_PROGRESS: "Em andamento",
    COMPLETED: "Concluida",
    BLOCKED: "Bloqueada",
  }[status];
}

export function TenantBillingPanel({ tenantId }: TenantBillingPanelProps) {
  const billingQuery = useSystemAdminTenantBillingQuery(tenantId);
  const purchasesQuery = useSystemAdminOneTimePurchasesQuery();
  const setupMutation = useUpdateOneTimePurchaseSetupStatusMutation();
  const updateCustomerMutation = useUpdateSystemAdminTenantBillingCustomerMutation(tenantId);

  if (!tenantId) {
    return (
      <PageState
        title="Selecione um tenant"
        description="Escolha um tenant para consultar o faturamento SaaS."
      />
    );
  }

  if (billingQuery.isLoading) {
    return (
      <div className="flex items-center gap-2 text-text-soft">
        <Loader2 size={16} className="animate-spin" />
        Carregando billing do tenant...
      </div>
    );
  }

  if (billingQuery.isError) {
    return (
      <PageState
        title="Falha ao carregar billing"
        description={getErrorMessage(billingQuery.error)}
        actionLabel="Tentar novamente"
        onAction={() => void billingQuery.refetch()}
      />
    );
  }

  const billing = billingQuery.data;
  const payments = billing?.payments ?? [];
  const setupQueue = (purchasesQuery.data?.items ?? []).filter(
    (purchase) => purchase.status === "PAID" && purchase.setupStatus !== "COMPLETED",
  );

  async function handleCustomerSubmit(input: BillingCustomerInput) {
    await updateCustomerMutation.mutateAsync(input);
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <CardTitle>Billing SaaS</CardTitle>
          <CardDescription className="mt-2">
            Visao financeira do tenant para suporte e auditoria. API keys nao sao expostas.
          </CardDescription>
        </div>
        {billing ? <SubscriptionStatusBadge status={billing.subscription.status} /> : null}
      </div>

      <section className="mt-6 rounded-2xl border border-amber-400/30 bg-amber-400/5 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-[var(--theme-text-primary)]">Implantacoes a configurar</h3>
            <p className="mt-1 text-sm text-text-soft">
              Compras pontuais pagas que exigem trabalho manual. Elas nao entram na recorrencia.
            </p>
          </div>
          <span className="rounded-full bg-amber-400/15 px-3 py-1 text-sm font-semibold text-amber-200">
            {setupQueue.length} pendente(s)
          </span>
        </div>
        {purchasesQuery.isError ? (
          <p className="mt-4 text-sm text-red-300">Nao foi possivel carregar a fila de implantacoes.</p>
        ) : setupQueue.length === 0 ? (
          <p className="mt-4 text-sm text-text-soft">Nenhuma implantacao paga pendente.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.16em] text-text-soft">
                <tr>
                  <th className="py-2 pr-4">Tenant</th>
                  <th className="py-2 pr-4">Servico</th>
                  <th className="py-2 pr-4">Valor</th>
                  <th className="py-2 pr-4">Situacao</th>
                  <th className="py-2 pr-4">Acao</th>
                </tr>
              </thead>
              <tbody>
                {setupQueue.map((purchase) => (
                  <tr key={purchase.id} className="border-t border-amber-400/15">
                    <td className="py-3 pr-4 font-semibold text-[var(--theme-text-primary)]">{purchase.tenantName}</td>
                    <td className="py-3 pr-4">{purchase.description}</td>
                    <td className="py-3 pr-4">{formatCurrency(purchase.amount)}</td>
                    <td className="py-3 pr-4">{setupStatusLabel(purchase.setupStatus)}</td>
                    <td className="py-3 pr-4">
                      <button
                        type="button"
                        className="rounded-lg border border-[var(--theme-border-subtle)] px-3 py-1.5 text-xs font-semibold hover:bg-white/10 disabled:opacity-50"
                        disabled={setupMutation.isPending}
                        onClick={() => void setupMutation.mutateAsync({
                          purchaseId: purchase.id,
                          setupStatus: purchase.setupStatus === "NOT_STARTED" ? "IN_PROGRESS" : "COMPLETED",
                        })}
                      >
                        {purchase.setupStatus === "NOT_STARTED" ? "Iniciar" : "Marcar concluida"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {billing ? (
        <dl className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--theme-border-subtle)] p-4">
            <dt className="text-xs uppercase tracking-[0.16em] text-text-soft">Plano</dt>
            <dd className="mt-1 font-semibold text-[var(--theme-text-primary)]">
              {billing.plan.name} - {formatCurrency(billing.plan.price)}
            </dd>
          </div>
          <div className="rounded-2xl border border-[var(--theme-border-subtle)] p-4">
            <dt className="text-xs uppercase tracking-[0.16em] text-text-soft">Proxima cobranca</dt>
            <dd className="mt-1 font-semibold text-[var(--theme-text-primary)]">
              {formatDate(billing.subscription.nextBillingDate)}
            </dd>
          </div>
          <div className="rounded-2xl border border-[var(--theme-border-subtle)] p-4">
            <dt className="text-xs uppercase tracking-[0.16em] text-text-soft">Tolerancia</dt>
            <dd className="mt-1 font-semibold text-[var(--theme-text-primary)]">
              {formatDate(billing.subscription.gracePeriodUntil)}
            </dd>
          </div>
        </dl>
      ) : null}

      {billing ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <section className="rounded-2xl border border-[var(--theme-border-subtle)] p-4">
            <h3 className="font-semibold text-[var(--theme-text-primary)]">Recorrencia atual</h3>
            <p className="mt-1 text-2xl font-bold text-[var(--theme-text-primary)]">
              {formatCurrency(billing.recurring.total)}
            </p>
            <div className="mt-3 grid gap-2 text-sm text-text-soft">
              {billing.recurring.items.map((item) => (
                <div key={`${item.productCode}-${item.priceCode}`} className="flex justify-between gap-3">
                  <span>{item.description} x{item.quantity}</span>
                  <span>{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-2xl border border-[var(--theme-border-subtle)] p-4">
            <h3 className="font-semibold text-[var(--theme-text-primary)]">Compras pontuais historicas</h3>
            <p className="mt-1 text-2xl font-bold text-[var(--theme-text-primary)]">
              {formatCurrency(billing.oneTimePurchases.paidTotal)}
            </p>
            <div className="mt-3 grid gap-2 text-sm text-text-soft">
              {billing.oneTimePurchases.items.length === 0 ? "Nenhuma compra pontual." : billing.oneTimePurchases.items.map((purchase) => (
                <div key={purchase.id} className="flex justify-between gap-3">
                  <span>{purchase.description} - {purchase.status}</span>
                  <span>{formatCurrency(purchase.amount)}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      <div className="mt-6 grid gap-3 text-sm">
        <div className="rounded-2xl border border-[var(--theme-border-subtle)] p-4">
          <p className="text-text-soft">Asaas Customer</p>
          <p className="mt-1 break-all font-semibold text-[var(--theme-text-primary)]">
            {billing?.subscription.providerCustomerId ?? "-"}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--theme-border-subtle)] p-4">
          <p className="text-text-soft">Asaas Subscription</p>
          <p className="mt-1 break-all font-semibold text-[var(--theme-text-primary)]">
            {billing?.subscription.providerSubscriptionId ?? "-"}
          </p>
        </div>
      </div>

      {billing ? (
        <div className="mt-6">
          <BillingCustomerForm
            value={billing.billingCustomer}
            isSaving={updateCustomerMutation.isPending}
            error={updateCustomerMutation.error}
            onSubmit={handleCustomerSubmit}
          />
        </div>
      ) : null}

      <div className="mt-6 overflow-x-auto">
        {payments.length === 0 ? (
          <p className="text-sm text-text-soft">Nenhuma cobranca registrada.</p>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.16em] text-text-soft">
              <tr>
                <th className="py-3 pr-4">Vencimento</th>
                <th className="py-3 pr-4">Valor</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Pagamento Asaas</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-t border-[var(--theme-border-subtle)]">
                  <td className="py-3 pr-4">{formatDate(payment.dueDate)}</td>
                  <td className="py-3 pr-4">{formatCurrency(payment.amount)}</td>
                  <td className="py-3 pr-4"><PaymentStatusBadge status={payment.status} /></td>
                  <td className="py-3 pr-4 break-all">{payment.providerPaymentId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
