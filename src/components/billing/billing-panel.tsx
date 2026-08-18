import { useSearchParams } from "react-router";
import { AlertTriangle, CreditCard, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/flow/button";
import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import { PageState } from "@/components/shared/page-state";
import {
  useBillingPaymentsQuery,
  useBillingStatusQuery,
  useCancelBillingSubscriptionMutation,
  useCreateBillingCheckoutMutation,
  useUpdateBillingCustomerMutation,
} from "@/hooks/use-billing-query";
import { ApiError } from "@/types/api";
import type { BillingCustomerInput } from "@/types/billing";
import { BillingCustomerForm } from "./billing-customer-form";
import { PaymentStatusBadge, SubscriptionStatusBadge } from "./billing-status-badge";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Nao foi possivel concluir a operacao.";
}

export function BillingPanel() {
  const [searchParams] = useSearchParams();
  const statusQuery = useBillingStatusQuery();
  const paymentsQuery = useBillingPaymentsQuery();
  const checkoutMutation = useCreateBillingCheckoutMutation();
  const cancelMutation = useCancelBillingSubscriptionMutation();
  const updateCustomerMutation = useUpdateBillingCustomerMutation();
  const checkoutReturn = searchParams.get("checkout");

  async function handleCheckout() {
    const result = await checkoutMutation.mutateAsync();
    window.location.assign(result.checkoutUrl);
  }

  async function handleCancel() {
    const confirmed = window.confirm(
      "Cancelar a renovacao da assinatura? Isso nao apaga dados do tenant.",
    );
    if (!confirmed) return;
    await cancelMutation.mutateAsync();
  }

  async function handleCustomerSubmit(input: BillingCustomerInput) {
    await updateCustomerMutation.mutateAsync(input);
  }

  if (statusQuery.isLoading || paymentsQuery.isLoading) {
    return (
      <div className="flex items-center gap-2 text-text-soft">
        <Loader2 size={18} className="animate-spin" />
        Carregando faturamento...
      </div>
    );
  }

  if (statusQuery.isError) {
    return (
      <PageState
        title="Falha ao carregar faturamento"
        description={getErrorMessage(statusQuery.error)}
        actionLabel="Tentar novamente"
        onAction={() => void statusQuery.refetch()}
      />
    );
  }

  const status = statusQuery.data;
  if (!status) {
    return (
      <PageState
        title="Faturamento indisponivel"
        description="A API nao retornou os dados de faturamento."
        actionLabel="Tentar novamente"
        onAction={() => void statusQuery.refetch()}
      />
    );
  }

  const payments = paymentsQuery.data?.items ?? [];
  const isBlocked = status.subscription.status === "SUSPENDED";
  const canCancel = ["ACTIVE", "PENDING", "GRACE_PERIOD", "OVERDUE"].includes(status.subscription.status);
  const checkoutLabel =
    status.subscription.status === "ACTIVE"
      ? "Atualizar pagamento"
      : status.subscription.status === "TRIALING"
        ? "Ativar assinatura"
        : "Regularizar assinatura";

  return (
    <div className="grid gap-6">
      {checkoutReturn === "success" ? (
        <Card variant="surface" padding="md" className="border-amber-300/40">
          <div className="flex gap-3">
            <RefreshCw className="mt-1 h-5 w-5 text-amber-200" />
            <div>
              <CardTitle>Checkout concluido no Asaas</CardTitle>
              <CardDescription className="mt-2">
                Recebemos o retorno do checkout. A confirmacao financeira sera feita pelo webhook do Asaas e pode levar alguns instantes.
              </CardDescription>
            </div>
          </div>
        </Card>
      ) : null}

      {isBlocked ? (
        <Card variant="surface" padding="md" className="border-red-300/40">
          <div className="flex gap-3">
            <AlertTriangle className="mt-1 h-5 w-5 text-red-200" />
            <div>
              <CardTitle>Assinatura suspensa</CardTitle>
              <CardDescription className="mt-2">
                Regularize o pagamento para reativar automaticamente o acesso operacional.
              </CardDescription>
            </div>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card variant="premium" padding="lg">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Assinatura Agendoro</CardTitle>
              <CardDescription className="mt-2">
                Mensalidade do SaaS cobrada pelo Asaas. O webhook e a fonte de confirmacao financeira.
              </CardDescription>
            </div>
            <SubscriptionStatusBadge status={status.subscription.status} />
          </div>

          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-[0.16em] text-text-soft">Plano</dt>
              <dd className="mt-1 text-lg font-bold text-[var(--theme-text-primary)]">{status.plan.name}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.16em] text-text-soft">Valor</dt>
              <dd className="mt-1 text-lg font-bold text-[var(--theme-text-primary)]">
                {formatCurrency(status.plan.price)}/mes
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.16em] text-text-soft">Proxima cobranca</dt>
              <dd className="mt-1 text-sm text-[var(--theme-text-primary)]">{formatDate(status.subscription.nextBillingDate)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.16em] text-text-soft">Tolerancia ate</dt>
              <dd className="mt-1 text-sm text-[var(--theme-text-primary)]">{formatDate(status.subscription.gracePeriodUntil)}</dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              type="button"
              size="md"
              onClick={() => void handleCheckout()}
              disabled={!status.enabled || checkoutMutation.isPending}
            >
              {checkoutMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
              {checkoutLabel}
            </Button>
            {canCancel ? (
              <Button
                type="button"
                variant="danger"
                size="md"
                onClick={() => void handleCancel()}
                disabled={cancelMutation.isPending}
              >
                Cancelar renovacao
              </Button>
            ) : null}
          </div>

          {!status.enabled ? (
            <p className="mt-4 text-sm text-amber-200">
              Billing esta desabilitado neste ambiente. Ative `BILLING_ENABLED=true` para criar checkout.
            </p>
          ) : null}
          {checkoutMutation.isError ? (
            <p className="mt-4 text-sm text-red-200">{getErrorMessage(checkoutMutation.error)}</p>
          ) : null}
          {cancelMutation.isError ? (
            <p className="mt-4 text-sm text-red-200">{getErrorMessage(cancelMutation.error)}</p>
          ) : null}
        </Card>

        <Card variant="glass" padding="lg">
          <CardTitle>Identificadores</CardTitle>
          <CardDescription className="mt-2">
            Dados tecnicos usados para suporte. Segredos nunca sao exibidos.
          </CardDescription>
          <div className="mt-5 grid gap-3 text-sm">
            <div className="rounded-2xl border border-[var(--theme-border-subtle)] p-3">
              <p className="text-text-soft">Provider</p>
              <p className="mt-1 font-semibold text-[var(--theme-text-primary)]">{status.subscription.provider}</p>
            </div>
            <div className="rounded-2xl border border-[var(--theme-border-subtle)] p-3">
              <p className="text-text-soft">Customer</p>
              <p className="mt-1 break-all font-semibold text-[var(--theme-text-primary)]">
                {status.subscription.providerCustomerId ?? "-"}
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--theme-border-subtle)] p-3">
              <p className="text-text-soft">Subscription</p>
              <p className="mt-1 break-all font-semibold text-[var(--theme-text-primary)]">
                {status.subscription.providerSubscriptionId ?? "-"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <BillingCustomerForm
        value={status.billingCustomer}
        isSaving={updateCustomerMutation.isPending}
        error={updateCustomerMutation.error}
        onSubmit={handleCustomerSubmit}
      />

      <Card variant="glass" padding="lg">
        <CardTitle>Historico de cobrancas</CardTitle>
        {paymentsQuery.isError ? (
          <PageState
            title="Falha ao carregar cobrancas"
            description={getErrorMessage(paymentsQuery.error)}
            actionLabel="Tentar novamente"
            onAction={() => void paymentsQuery.refetch()}
          />
        ) : payments.length === 0 ? (
          <p className="mt-4 text-sm text-text-soft">Nenhuma cobranca registrada ainda.</p>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.16em] text-text-soft">
                <tr>
                  <th className="py-3 pr-4">Vencimento</th>
                  <th className="py-3 pr-4">Valor</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4">Metodo</th>
                  <th className="py-3 pr-4">Pagamento</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-t border-[var(--theme-border-subtle)]">
                    <td className="py-3 pr-4">{formatDate(payment.dueDate)}</td>
                    <td className="py-3 pr-4">{formatCurrency(payment.amount)}</td>
                    <td className="py-3 pr-4"><PaymentStatusBadge status={payment.status} /></td>
                    <td className="py-3 pr-4">{payment.billingType ?? "-"}</td>
                    <td className="py-3 pr-4">{formatDate(payment.paidAt ?? payment.confirmedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
