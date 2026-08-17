import { Loader2 } from "lucide-react";
import { CardDescription, CardTitle } from "@/components/flow/card";
import { PageState } from "@/components/shared/page-state";
import {
  useSystemAdminTenantBillingQuery,
  useUpdateSystemAdminTenantBillingCustomerMutation,
} from "@/hooks/use-billing-query";
import { BillingCustomerForm } from "@/components/billing/billing-customer-form";
import { PaymentStatusBadge, SubscriptionStatusBadge } from "@/components/billing/billing-status-badge";
import { ApiError } from "@/types/api";
import type { BillingCustomerInput } from "@/types/billing";

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

export function TenantBillingPanel({ tenantId }: TenantBillingPanelProps) {
  const billingQuery = useSystemAdminTenantBillingQuery(tenantId);
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
