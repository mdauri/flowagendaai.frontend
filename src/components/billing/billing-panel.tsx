import { useState } from "react";
import { useSearchParams } from "react-router";
import { AlertTriangle, CreditCard, Loader2, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/flow/button";
import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import { PageState } from "@/components/shared/page-state";
import {
  useBillingPaymentsQuery,
  useBillingStatusQuery,
  useCancelBillingSubscriptionMutation,
  useCreateBillingCheckoutMutation,
  useCreateBillingOneTimePurchaseMutation,
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
  const oneTimeMutation = useCreateBillingOneTimePurchaseMutation();
  const cancelMutation = useCancelBillingSubscriptionMutation();
  const updateCustomerMutation = useUpdateBillingCustomerMutation();
  const checkoutReturn = searchParams.get("checkout");
  const [basePlan, setBasePlan] = useState<"AGENDORO_MONTHLY" | "AGENDORO_ANNUAL">("AGENDORO_MONTHLY");
  const [additionalProfessionals, setAdditionalProfessionals] = useState(0);
  const [whatsappAddon, setWhatsappAddon] = useState(false);
  const [checkoutLinks, setCheckoutLinks] = useState<string[]>([]);

  async function handleCheckout() {
    const result = await checkoutMutation.mutateAsync({
      basePlan,
      additionalProfessionals,
      whatsappAddon,
    });
    const links = result.checkoutUrls ?? [result.checkoutUrl];
    if (links.length > 1) {
      setCheckoutLinks(links);
      return;
    }
    window.location.assign(result.checkoutUrl);
  }

  async function handleOneTimePurchase(productCode: "ASSISTED_ONBOARDING" | "WHATSAPP_ONBOARDING") {
    const result = await oneTimeMutation.mutateAsync({ productCode });
    window.location.assign(result.paymentUrl);
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
  const isBlocked = status.entitlement.accessStatus === "SUSPENDED";
  const isTrialActive = status.entitlement.accessStatus === "TRIAL_ACTIVE";
  const isPaymentPending = status.entitlement.accessStatus === "PAYMENT_PENDING";
  const isBillingExempt = status.entitlement.accessStatus === "BILLING_EXEMPT";
  const canCancel = ["ACTIVE", "PENDING", "GRACE_PERIOD", "OVERDUE"].includes(status.subscription.status);
  const checkoutLabel =
    status.subscription.status === "ACTIVE"
      ? "Atualizar pagamento"
      : status.subscription.status === "TRIALING"
        ? "Ativar assinatura"
        : "Regularizar assinatura";

  return (
    <div className="grid gap-6">
      {isTrialActive ? (
        <Card
          variant="surface"
          padding="md"
          className={
            typeof status.entitlement.trialDaysRemaining === "number" &&
            status.entitlement.trialDaysRemaining <= 3
              ? "border-amber-300/40"
              : "border-sky-300/40"
          }
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Voce esta no periodo gratuito.</CardTitle>
              <CardDescription className="mt-2">
                Restam {status.entitlement.trialDaysRemaining ?? 0} dias. Voce pode assinar agora sem perder os dias gratuitos restantes.
              </CardDescription>
            </div>
            <Button
              type="button"
              size="md"
              onClick={() => void handleCheckout()}
              disabled={!status.enabled || checkoutMutation.isPending}
              className="w-full sm:w-auto"
            >
              {checkoutMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
              Assinar Agendoro
            </Button>
          </div>
        </Card>
      ) : null}

      {isBillingExempt ? (
        <Card variant="surface" padding="md" className="border-emerald-300/40">
          <div className="flex gap-3">
            <CreditCard className="mt-1 h-5 w-5 text-emerald-200" />
            <div>
              <CardTitle>Conta isenta de cobranca.</CardTitle>
              <CardDescription className="mt-2">
                Seu acesso ao Agendoro esta liberado sem mensalidade.
              </CardDescription>
            </div>
          </div>
        </Card>
      ) : null}

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
              <CardTitle>Seu periodo gratuito terminou.</CardTitle>
              <CardDescription className="mt-2">
                Assine o Agendoro por R$ 97/mes para continuar usando sua agenda.
              </CardDescription>
            </div>
          </div>
        </Card>
      ) : null}

      {isPaymentPending ? (
        <Card variant="surface" padding="md" className="border-amber-300/40">
          <div className="flex gap-3">
            <RefreshCw className="mt-1 h-5 w-5 text-amber-200" />
            <div>
              <CardTitle>Pagamento pendente</CardTitle>
              <CardDescription className="mt-2">
                A cobranca foi criada, mas o acesso pago depende da confirmacao financeira do Asaas.
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
              <dt className="text-xs uppercase tracking-[0.16em] text-text-soft">Fim do trial</dt>
              <dd className="mt-1 text-sm text-[var(--theme-text-primary)]">{formatDate(status.subscription.trialEndsAt)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.16em] text-text-soft">Tolerancia ate</dt>
              <dd className="mt-1 text-sm text-[var(--theme-text-primary)]">{formatDate(status.subscription.gracePeriodUntil)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.16em] text-text-soft">Isencao</dt>
              <dd className="mt-1 text-sm text-[var(--theme-text-primary)]">
                {status.subscription.isBillingExempt ? "Sim" : "Nao"}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.16em] text-text-soft">Profissionais</dt>
              <dd className="mt-1 text-sm text-[var(--theme-text-primary)]">
                {status.seats.activeProfessionals}/{status.seats.maxProfessionals} ativos
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.16em] text-text-soft">Adicionais</dt>
              <dd className="mt-1 text-sm text-[var(--theme-text-primary)]">
                {status.seats.additionalProfessionals} contratado(s)
              </dd>
            </div>
          </dl>

          <div className="mt-6 border-t border-[var(--theme-border-subtle)] pt-6">
            <h3 className="text-sm font-bold text-[var(--theme-text-primary)]">Cobrancas recorrentes</h3>
            <div className="mt-3 space-y-2">
              {status.recurring.items.length > 0 ? status.recurring.items.map((item) => (
                <div key={`${item.priceCode}-${item.cycle}`} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-text-soft">
                    {item.description}
                    {item.quantity > 1 ? ` x ${item.quantity}` : ""}
                  </span>
                  <span className="font-semibold text-[var(--theme-text-primary)]">
                    {formatCurrency(item.amount)}
                    {item.cycle === "YEARLY" ? "/ano" : "/mes"}
                  </span>
                </div>
              )) : (
                <p className="text-sm text-text-soft">Nenhuma cobranca recorrente ativa.</p>
              )}
              <div className="flex items-center justify-between border-t border-[var(--theme-border-subtle)] pt-3 text-sm font-bold text-[var(--theme-text-primary)]">
                <span>Total recorrente</span>
                <span>{formatCurrency(status.recurring.total)}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 rounded-md border border-[var(--theme-border-subtle)] p-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="text-sm font-semibold text-[var(--theme-text-primary)]">
                Plano
                <select
                  className="mt-2 w-full rounded-md border border-[var(--theme-border-subtle)] bg-transparent p-2 text-sm"
                  value={basePlan}
                  onChange={(event) => setBasePlan(event.target.value as "AGENDORO_MONTHLY" | "AGENDORO_ANNUAL")}
                >
                  <option value="AGENDORO_MONTHLY">Mensal R$97</option>
                  <option value="AGENDORO_ANNUAL">Anual R$970</option>
                </select>
              </label>
              <label className="text-sm font-semibold text-[var(--theme-text-primary)]">
                Profissionais adicionais
                <input
                  className="mt-2 w-full rounded-md border border-[var(--theme-border-subtle)] bg-transparent p-2 text-sm"
                  min={0}
                  type="number"
                  value={additionalProfessionals}
                  onChange={(event) => setAdditionalProfessionals(Math.max(0, Number(event.target.value) || 0))}
                />
              </label>
              <label className="flex items-center gap-2 pt-7 text-sm font-semibold text-[var(--theme-text-primary)]">
                <input
                  type="checkbox"
                  checked={whatsappAddon}
                  onChange={(event) => setWhatsappAddon(event.target.checked)}
                />
                WhatsApp R$100/mes
              </label>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              type="button"
              size="md"
              onClick={() => void handleCheckout()}
              disabled={!status.enabled || isBillingExempt || checkoutMutation.isPending}
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
          {checkoutLinks.length > 1 ? (
            <div className="mt-4 grid gap-2 rounded-md border border-amber-300/40 p-3 text-sm">
              <p className="font-semibold text-amber-100">Esta combinacao possui ciclos separados. Conclua cada checkout:</p>
              {checkoutLinks.map((link, index) => (
                <a key={link} href={link} target="_blank" rel="noreferrer" className="text-amber-200 underline">
                  Abrir checkout {index + 1}
                </a>
              ))}
            </div>
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

        <Card variant="surface" padding="lg">
          <CardTitle>Servicos avulsos</CardTitle>
          <CardDescription className="mt-2">
            Implantacoes sao cobradas uma unica vez e nao entram na recorrencia.
          </CardDescription>
          <div className="mt-5 grid gap-3">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => void handleOneTimePurchase("ASSISTED_ONBOARDING")}
              disabled={!status.enabled || isBillingExempt || oneTimeMutation.isPending}
            >
              {oneTimeMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Implantacao assistida {formatCurrency(197)}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => void handleOneTimePurchase("WHATSAPP_ONBOARDING")}
              disabled={!status.enabled || isBillingExempt || oneTimeMutation.isPending}
            >
              {oneTimeMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Implantacao WhatsApp {formatCurrency(297)}
            </Button>
            {oneTimeMutation.isError ? (
              <p className="text-sm text-red-200">{getErrorMessage(oneTimeMutation.error)}</p>
            ) : null}
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
