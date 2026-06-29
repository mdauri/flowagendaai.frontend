import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/flow/button";
import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import { Input } from "@/components/flow/input";
import { Select } from "@/components/flow/select";
import { Textarea } from "@/components/flow/textarea";
import { SectionHeading } from "@/components/flow/section-heading";
import { PageState } from "@/components/shared/page-state";
import { SubscriptionPlanCard } from "@/components/subscription-club/subscription-plan-card";
import { WeekdayToggleGroup } from "@/components/subscription-club/weekday-toggle-group";
import { useAuth } from "@/hooks/use-auth";
import { useDeactivateSubscriptionPlanMutation, useSaveSubscriptionPlanMutation } from "@/hooks/use-save-subscription-plan-mutation";
import { useServicesQuery } from "@/hooks/use-services-query";
import { useSubscriptionPlansQuery } from "@/hooks/use-subscription-plans-query";
import { ApiError } from "@/types/api";
import type { CreateSubscriptionPlanInput, SubscriptionPlan, SubscriptionPlanStatus, SubscriptionUsagePeriod } from "@/types/subscription-club";

interface PlanDraftService {
  serviceId: string;
  quantityLimit: number;
  usagePeriod: SubscriptionUsagePeriod;
}

interface PlanDraft {
  name: string;
  description: string;
  monthlyPrice: string;
  status: SubscriptionPlanStatus;
  allowedWeekDays: number[];
  services: PlanDraftService[];
}

const defaultDraft: PlanDraft = {
  name: "",
  description: "",
  monthlyPrice: "",
  status: "ACTIVE",
  allowedWeekDays: [1, 2, 3, 4],
  services: [{ serviceId: "", quantityLimit: 1, usagePeriod: "WEEKLY" }],
};

export function SubscriptionPlansPage() {
  const auth = useAuth();
  const moduleEnabled = Boolean(auth.tenant?.subscriptionClubAllowed && auth.tenant?.subscriptionClubEnabled);
  const plansQuery = useSubscriptionPlansQuery(moduleEnabled);
  const servicesQuery = useServicesQuery();
  const saveMutation = useSaveSubscriptionPlanMutation();
  const deactivateMutation = useDeactivateSubscriptionPlanMutation();
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [draft, setDraft] = useState(defaultDraft);
  const [formError, setFormError] = useState<string | null>(null);

  const serviceOptions = useMemo(
    () => [
      { label: "Selecione", value: "" },
      ...(servicesQuery.data?.services ?? []).map((service) => ({
        label: service.name,
        value: service.id,
      })),
    ],
    [servicesQuery.data?.services]
  );

  if (!auth.tenant?.subscriptionClubAllowed) {
    return <PageState title="Clube nao liberado" description="O system-admin ainda nao liberou o Clube para este tenant." />;
  }

  if (!auth.tenant.subscriptionClubEnabled) {
    return <PageState title="Clube desativado" description="Ative o Clube em Configuracoes para gerenciar planos." />;
  }

  function resetForm() {
    setEditingPlan(null);
    setDraft(defaultDraft);
    setFormError(null);
  }

  function applyPlanToForm(plan: SubscriptionPlan) {
    setEditingPlan(plan);
    setDraft({
      name: plan.name,
      description: plan.description ?? "",
      monthlyPrice: plan.monthlyPrice,
      status: plan.status,
      allowedWeekDays: plan.allowedWeekDays,
      services: plan.services.map((rule) => ({
        serviceId: rule.serviceId,
        quantityLimit: rule.quantityLimit,
        usagePeriod: rule.usagePeriod,
      })),
    });
    setFormError(null);
  }

  function updateServiceRule(index: number, patch: Partial<PlanDraftService>) {
    setDraft((current) => ({
      ...current,
      services: current.services.map((rule, ruleIndex) =>
        ruleIndex === index ? { ...rule, ...patch } : rule
      ),
    }));
  }

  async function handleSubmit() {
    setFormError(null);

    if (!draft.name.trim()) {
      setFormError("Nome do plano e obrigatorio.");
      return;
    }

    if (!draft.monthlyPrice.trim()) {
      setFormError("Valor mensal e obrigatorio.");
      return;
    }

    if (draft.allowedWeekDays.length === 0) {
      setFormError("Selecione ao menos um dia permitido.");
      return;
    }

    const validServices = draft.services.filter((rule) => rule.serviceId && rule.quantityLimit > 0);

    if (validServices.length === 0) {
      setFormError("Inclua ao menos um servico com limite valido.");
      return;
    }

    const payload: CreateSubscriptionPlanInput = {
      name: draft.name.trim(),
      description: draft.description.trim() || null,
      monthlyPrice: draft.monthlyPrice.trim(),
      status: draft.status,
      allowedWeekDays: draft.allowedWeekDays,
      services: validServices,
    };

    try {
      await saveMutation.mutateAsync({
        id: editingPlan?.id,
        payload,
      });
      resetForm();
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "Nao foi possivel salvar o plano.");
    }
  }

  return (
    <>
      <SectionHeading
        eyebrow="Clube"
        title="Planos de assinatura"
        description="Crie planos mensais com servicos, limite por periodo e dias permitidos."
      />

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,28rem)_minmax(0,1fr)]">
        <Card variant="premium" padding="lg" className="content-start">
          <CardTitle>{editingPlan ? "Editar plano" : "Novo plano"}</CardTitle>
          <CardDescription className="mt-2">
            V1 sem acummulo, sem courtesy e sem limite por faixa de horario.
          </CardDescription>

          <div className="mt-5 grid gap-4">
            <label className="grid gap-2 text-sm font-semibold text-text-soft">
              Nome
              <Input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Plano Chavoso" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-text-soft">
              Valor mensal
              <Input value={draft.monthlyPrice} onChange={(event) => setDraft({ ...draft, monthlyPrice: event.target.value })} placeholder="89.90" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-text-soft">
              Descricao
              <Textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="Inclui corte simples 1x por semana." />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-text-soft">
              Status
              <Select
                value={draft.status}
                onValueChange={(status) => setDraft({ ...draft, status: status as "ACTIVE" | "INACTIVE" })}
                options={[
                  { label: "Ativo", value: "ACTIVE" },
                  { label: "Inativo", value: "INACTIVE" },
                ]}
              />
            </label>
            <div className="grid gap-2">
              <span className="text-sm font-semibold text-text-soft">Dias permitidos</span>
              <WeekdayToggleGroup
                value={draft.allowedWeekDays}
                onChange={(allowedWeekDays) => setDraft({ ...draft, allowedWeekDays })}
              />
            </div>

            <div className="grid gap-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-text-soft">Servicos inclusos</span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setDraft((current) => ({
                      ...current,
                      services: [
                        ...current.services,
                        { serviceId: "", quantityLimit: 1, usagePeriod: "WEEKLY" },
                      ],
                    }))
                  }
                >
                  Adicionar
                </Button>
              </div>
              {draft.services.map((rule, index) => (
                <div key={index} className="grid gap-3 rounded-2xl border border-[var(--theme-border-subtle)] bg-black/10 p-3">
                  <Select
                    value={rule.serviceId}
                    onValueChange={(serviceId) => updateServiceRule(index, { serviceId })}
                    options={serviceOptions}
                    disabled={servicesQuery.isLoading}
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input
                      type="number"
                      min={1}
                      value={rule.quantityLimit}
                      onChange={(event) => updateServiceRule(index, { quantityLimit: Number(event.target.value) })}
                    />
                    <Select
                      value={rule.usagePeriod}
                      onValueChange={(usagePeriod) => updateServiceRule(index, { usagePeriod: usagePeriod as SubscriptionUsagePeriod })}
                      options={[
                        { label: "Semanal", value: "WEEKLY" },
                        { label: "Mensal", value: "MONTHLY" },
                      ]}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {formError ? (
            <p className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200" role="alert">
              {formError}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="md" onClick={() => void handleSubmit()} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar plano"
              )}
            </Button>
            {editingPlan ? (
              <Button variant="ghost" size="md" onClick={resetForm}>
                Cancelar
              </Button>
            ) : null}
          </div>
        </Card>

        <div className="grid content-start gap-4">
          {plansQuery.isLoading ? (
            <PageState title="Carregando planos" description="Buscando planos de assinatura." />
          ) : plansQuery.isError ? (
            <PageState
              title="Nao foi possivel carregar planos"
              description="Tente novamente."
              actionLabel="Recarregar"
              onAction={() => void plansQuery.refetch()}
            />
          ) : (plansQuery.data?.items ?? []).length === 0 ? (
            <PageState title="Nenhum plano" description="Crie o primeiro plano de assinatura." />
          ) : (
            plansQuery.data?.items.map((plan) => (
              <SubscriptionPlanCard
                key={plan.id}
                plan={plan}
                onEdit={applyPlanToForm}
                onDeactivate={(target) => void deactivateMutation.mutateAsync(target.id)}
                isDeactivating={deactivateMutation.isPending}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}
