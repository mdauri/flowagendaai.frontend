import { Button } from "@/components/flow/button";
import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import { Badge } from "@/components/flow/badge";
import type { SubscriptionPlan } from "@/types/subscription-club";

const weekdayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan;
  onEdit: (plan: SubscriptionPlan) => void;
  onDeactivate: (plan: SubscriptionPlan) => void;
  isDeactivating?: boolean;
}

export function SubscriptionPlanCard({
  plan,
  onEdit,
  onDeactivate,
  isDeactivating = false,
}: SubscriptionPlanCardProps) {
  return (
    <Card variant="glass" padding="md" className="grid gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <CardTitle>{plan.name}</CardTitle>
          <CardDescription className="mt-1">
            R$ {plan.monthlyPrice}/mes
          </CardDescription>
        </div>
        <Badge variant={plan.status === "ACTIVE" ? "success" : "neutral"}>
          {plan.status === "ACTIVE" ? "Ativo" : "Inativo"}
        </Badge>
      </div>

      {plan.description ? (
        <p className="text-sm leading-6 text-text-soft">{plan.description}</p>
      ) : null}

      <div className="grid gap-2 text-sm text-text-soft">
        <span>
          Dias:{" "}
          <strong className="text-[var(--theme-text-primary)]">
            {plan.allowedWeekDays.map((day) => weekdayLabels[day] ?? day).join(", ")}
          </strong>
        </span>
        <span>
          Regra: <strong className="text-[var(--theme-text-primary)]">nao cumulativo</strong>
        </span>
      </div>

      <ul className="grid gap-2">
        {plan.services.map((rule) => (
          <li
            key={rule.id}
            className="rounded-2xl border border-[var(--theme-border-subtle)] bg-black/10 px-4 py-3 text-sm text-text-soft"
          >
            <span className="font-semibold text-[var(--theme-text-primary)]">
              {rule.serviceName ?? rule.serviceId}
            </span>{" "}
            {rule.quantityLimit}x por {rule.usagePeriod === "WEEKLY" ? "semana" : "mes"}
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={() => onEdit(plan)}>
          Editar
        </Button>
        {plan.status === "ACTIVE" ? (
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDeactivate(plan)}
            disabled={isDeactivating}
          >
            Inativar
          </Button>
        ) : null}
      </div>
    </Card>
  );
}
