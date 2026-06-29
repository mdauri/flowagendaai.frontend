import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/flow/button";
import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import { Input } from "@/components/flow/input";
import { Select } from "@/components/flow/select";
import { SectionHeading } from "@/components/flow/section-heading";
import { PageState } from "@/components/shared/page-state";
import { CustomerSubscriptionStatusBadge } from "@/components/subscription-club/customer-subscription-status-badge";
import { MarkSubscriptionPaidDialog } from "@/components/subscription-club/mark-subscription-paid-dialog";
import { useAuth } from "@/hooks/use-auth";
import { useCustomerSubscriptionDetailQuery } from "@/hooks/use-customer-subscription-detail-query";
import { useCustomerSubscriptionsQuery } from "@/hooks/use-customer-subscriptions-query";
import { useMarkSubscriptionPaidMutation } from "@/hooks/use-mark-subscription-paid-mutation";
import { useCustomerSubscriptionStatusMutation, useSaveCustomerSubscriptionMutation } from "@/hooks/use-save-customer-subscription-mutation";
import { useSubscriptionPlansQuery } from "@/hooks/use-subscription-plans-query";
import { ApiError } from "@/types/api";
import type { CreateCustomerSubscriptionInput, CustomerSubscription, CustomerSubscriptionStatus, MarkSubscriptionPaidInput } from "@/types/subscription-club";

function isoFromDateInput(value: string) {
  return new Date(`${value}T12:00:00.000Z`).toISOString();
}

function todayDateInput() {
  return new Date().toISOString().slice(0, 10);
}

function addMonthDateInput() {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return date.toISOString().slice(0, 10);
}

const statusOptions: Array<{ label: string; value: CustomerSubscriptionStatus }> = [
  { label: "Ativa", value: "ACTIVE" },
  { label: "Pendente", value: "PAYMENT_PENDING" },
  { label: "Pausada", value: "PAUSED" },
  { label: "Cancelada", value: "CANCELLED" },
  { label: "Vencida", value: "EXPIRED" },
];

export function CustomerSubscriptionsPage() {
  const auth = useAuth();
  const moduleEnabled = Boolean(auth.tenant?.subscriptionClubAllowed && auth.tenant?.subscriptionClubEnabled);
  const subscriptionsQuery = useCustomerSubscriptionsQuery(moduleEnabled);
  const plansQuery = useSubscriptionPlansQuery(moduleEnabled);
  const saveMutation = useSaveCustomerSubscriptionMutation();
  const statusMutation = useCustomerSubscriptionStatusMutation();
  const markPaidMutation = useMarkSubscriptionPaidMutation();
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<string | null>(null);
  const detailQuery = useCustomerSubscriptionDetailQuery(selectedSubscriptionId);
  const [paymentTargetId, setPaymentTargetId] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    subscriptionPlanId: "",
    status: "PAYMENT_PENDING" as CustomerSubscriptionStatus,
    startsAt: todayDateInput(),
    endsAt: "",
    currentCycleStart: todayDateInput(),
    currentCycleEnd: addMonthDateInput(),
    nextBillingAt: addMonthDateInput(),
  });

  const planOptions = useMemo(
    () => [
      { label: "Selecione um plano", value: "" },
      ...(plansQuery.data?.items ?? [])
        .filter((plan) => plan.status === "ACTIVE")
        .map((plan) => ({ label: plan.name, value: plan.id })),
    ],
    [plansQuery.data?.items]
  );

  if (!auth.tenant?.subscriptionClubAllowed) {
    return <PageState title="Clube nao liberado" description="O system-admin ainda nao liberou o Clube para este tenant." />;
  }

  if (!auth.tenant.subscriptionClubEnabled) {
    return <PageState title="Clube desativado" description="Ative o Clube em Configuracoes para gerenciar assinantes." />;
  }

  async function handleCreateSubscription() {
    setFormError(null);

    if (!draft.customerName.trim() && !draft.customerPhone.trim()) {
      setFormError("Informe nome ou telefone do cliente.");
      return;
    }

    if (!draft.subscriptionPlanId) {
      setFormError("Selecione um plano.");
      return;
    }

    const payload: CreateCustomerSubscriptionInput = {
      customer: {
        name: draft.customerName.trim() || null,
        phone: draft.customerPhone.trim() || null,
        email: draft.customerEmail.trim() || null,
      },
      subscriptionPlanId: draft.subscriptionPlanId,
      status: draft.status,
      startsAt: isoFromDateInput(draft.startsAt),
      endsAt: draft.endsAt ? isoFromDateInput(draft.endsAt) : null,
      currentCycleStart: isoFromDateInput(draft.currentCycleStart),
      currentCycleEnd: isoFromDateInput(draft.currentCycleEnd),
      nextBillingAt: draft.nextBillingAt ? isoFromDateInput(draft.nextBillingAt) : null,
    };

    try {
      await saveMutation.mutateAsync({ payload });
      setDraft({
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        subscriptionPlanId: "",
        status: "PAYMENT_PENDING",
        startsAt: todayDateInput(),
        endsAt: "",
        currentCycleStart: todayDateInput(),
        currentCycleEnd: addMonthDateInput(),
        nextBillingAt: addMonthDateInput(),
      });
    } catch (error) {
      if (error instanceof ApiError && error.code === "CUSTOMER_ALREADY_HAS_ACTIVE_SUBSCRIPTION") {
        setFormError("Cliente ja tem assinatura ativa.");
      } else {
        setFormError(error instanceof ApiError ? error.message : "Nao foi possivel criar assinatura.");
      }
    }
  }

  async function handleMarkPaid(input: MarkSubscriptionPaidInput) {
    if (!paymentTargetId) {
      return;
    }

    setPaymentError(null);

    try {
      await markPaidMutation.mutateAsync({
        id: paymentTargetId,
        payload: input,
      });
      setPaymentTargetId(null);
    } catch (error) {
      setPaymentError(error instanceof ApiError ? error.message : "Nao foi possivel registrar o pagamento.");
    }
  }

  function subscriptionCustomerLabel(subscription: CustomerSubscription) {
    return (
      subscription.customer?.name ??
      subscription.customer?.phone ??
      subscription.customerId
    );
  }

  return (
    <>
      <SectionHeading
        eyebrow="Clube"
        title="Assinantes"
        description="Vincule clientes a planos, altere status e registre pagamentos manuais."
      />

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,28rem)_minmax(0,1fr)]">
        <Card variant="premium" padding="lg" className="content-start">
          <CardTitle>Novo assinante</CardTitle>
          <CardDescription className="mt-2">
            Cliente minimo: nome, telefone e email opcionais para vinculo ao plano.
          </CardDescription>

          <div className="mt-5 grid gap-4">
            <label className="grid gap-2 text-sm font-semibold text-text-soft">
              Nome
              <Input value={draft.customerName} onChange={(event) => setDraft({ ...draft, customerName: event.target.value })} placeholder="Joao" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-text-soft">
              Telefone
              <Input value={draft.customerPhone} onChange={(event) => setDraft({ ...draft, customerPhone: event.target.value })} placeholder="(11) 99999-9999" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-text-soft">
              Email
              <Input value={draft.customerEmail} onChange={(event) => setDraft({ ...draft, customerEmail: event.target.value })} placeholder="cliente@email.com" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-text-soft">
              Plano
              <Select
                value={draft.subscriptionPlanId}
                onValueChange={(subscriptionPlanId) => setDraft({ ...draft, subscriptionPlanId })}
                options={planOptions}
                disabled={plansQuery.isLoading}
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-text-soft">
              Status inicial
              <Select
                value={draft.status}
                onValueChange={(status) => setDraft({ ...draft, status: status as CustomerSubscriptionStatus })}
                options={statusOptions}
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-text-soft">
                Inicio
                <Input type="date" value={draft.startsAt} onChange={(event) => setDraft({ ...draft, startsAt: event.target.value })} />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-text-soft">
                Fim
                <Input type="date" value={draft.endsAt} onChange={(event) => setDraft({ ...draft, endsAt: event.target.value })} />
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-text-soft">
                Ciclo atual inicio
                <Input type="date" value={draft.currentCycleStart} onChange={(event) => setDraft({ ...draft, currentCycleStart: event.target.value })} />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-text-soft">
                Ciclo atual fim
                <Input type="date" value={draft.currentCycleEnd} onChange={(event) => setDraft({ ...draft, currentCycleEnd: event.target.value })} />
              </label>
            </div>
            <label className="grid gap-2 text-sm font-semibold text-text-soft">
              Proxima cobranca
              <Input type="date" value={draft.nextBillingAt} onChange={(event) => setDraft({ ...draft, nextBillingAt: event.target.value })} />
            </label>
          </div>

          {formError ? (
            <p className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200" role="alert">
              {formError}
            </p>
          ) : null}

          <Button className="mt-6" size="md" onClick={() => void handleCreateSubscription()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Salvando...
              </>
            ) : (
              "Vincular cliente"
            )}
          </Button>
        </Card>

        <div className="grid content-start gap-4">
          {subscriptionsQuery.isLoading ? (
            <PageState title="Carregando assinantes" description="Buscando assinaturas do tenant." />
          ) : subscriptionsQuery.isError ? (
            <PageState
              title="Nao foi possivel carregar assinantes"
              description="Tente novamente."
              actionLabel="Recarregar"
              onAction={() => void subscriptionsQuery.refetch()}
            />
          ) : (subscriptionsQuery.data?.items ?? []).length === 0 ? (
            <PageState title="Sem assinantes" description="Vincule o primeiro cliente a um plano." />
          ) : (
            subscriptionsQuery.data?.items.map((subscription) => (
              <Card key={subscription.id} variant="glass" padding="md" className="grid gap-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle>{subscriptionCustomerLabel(subscription)}</CardTitle>
                    <CardDescription className="mt-1">
                      {subscription.plan?.name ?? subscription.subscriptionPlanId}
                    </CardDescription>
                  </div>
                  <CustomerSubscriptionStatusBadge status={subscription.status} />
                </div>

                <div className="grid gap-1 text-sm text-text-soft sm:grid-cols-2">
                  <span>Ciclo: {subscription.currentCycleStart.slice(0, 10)} ate {subscription.currentCycleEnd.slice(0, 10)}</span>
                  <span>Proxima cobranca: {subscription.nextBillingAt?.slice(0, 10) ?? "nao informada"}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setSelectedSubscriptionId(subscription.id)}>
                    Ver historico
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setPaymentTargetId(subscription.id)}>
                    Marcar pago
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={statusMutation.isPending}
                    onClick={() => void statusMutation.mutateAsync({ id: subscription.id, action: "activate" })}
                  >
                    Ativar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={statusMutation.isPending}
                    onClick={() => void statusMutation.mutateAsync({ id: subscription.id, action: "pause" })}
                  >
                    Pausar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={statusMutation.isPending}
                    onClick={() => void statusMutation.mutateAsync({ id: subscription.id, action: "cancel" })}
                  >
                    Cancelar
                  </Button>
                </div>
              </Card>
            ))
          )}

          {selectedSubscriptionId ? (
            <Card variant="premium" padding="lg" className="grid gap-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>Historico</CardTitle>
                  <CardDescription className="mt-1">Pagamentos e usos da assinatura.</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedSubscriptionId(null)}>
                  Fechar
                </Button>
              </div>

              {detailQuery.isLoading ? (
                <p className="text-sm text-text-soft">Carregando historico...</p>
              ) : detailQuery.isError ? (
                <p className="text-sm text-red-200" role="alert">Nao foi possivel carregar o historico.</p>
              ) : (
                <>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--theme-text-primary)]">Pagamentos</h3>
                    {(detailQuery.data?.payments ?? []).length === 0 ? (
                      <p className="mt-2 text-sm text-text-soft">Sem pagamentos.</p>
                    ) : (
                      <ul className="mt-2 grid gap-2">
                        {detailQuery.data?.payments.map((payment) => (
                          <li key={payment.id} className="rounded-2xl border border-[var(--theme-border-subtle)] bg-black/10 px-3 py-2 text-sm text-text-soft">
                            R$ {payment.amount} - {payment.status} - {payment.paidAt?.slice(0, 10) ?? "sem data"}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[var(--theme-text-primary)]">Consumos</h3>
                    {(detailQuery.data?.usages ?? []).length === 0 ? (
                      <p className="mt-2 text-sm text-text-soft">Sem usos.</p>
                    ) : (
                      <ul className="mt-2 grid gap-2">
                        {detailQuery.data?.usages.map((usage) => (
                          <li key={usage.id} className="rounded-2xl border border-[var(--theme-border-subtle)] bg-black/10 px-3 py-2 text-sm text-text-soft">
                            {usage.serviceName ?? usage.serviceId} - {usage.status} - {usage.consumedAt.slice(0, 10)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </>
              )}
            </Card>
          ) : null}
        </div>
      </div>

      <MarkSubscriptionPaidDialog
        subscriptionId={paymentTargetId}
        isSubmitting={markPaidMutation.isPending}
        errorMessage={paymentError}
        onClose={() => {
          setPaymentTargetId(null);
          setPaymentError(null);
        }}
        onConfirm={(input) => void handleMarkPaid(input)}
      />
    </>
  );
}
