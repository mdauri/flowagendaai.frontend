import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/flow/button";
import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import { Checkbox } from "@/components/flow/checkbox";
import { Input } from "@/components/flow/input";
import { useValidateSubscriptionUsageMutation } from "@/hooks/use-validate-subscription-usage-mutation";
import { ApiError } from "@/types/api";
import type { ValidateSubscriptionUsageResponse } from "@/types/subscription-club";

export interface BookingSubscriptionSelection {
  useSubscription: boolean;
  customerPhone: string;
  customerSubscriptionId?: string;
  subscriptionPlanId?: string;
}

interface BookingSubscriptionOptionProps {
  enabled: boolean;
  serviceId: string;
  startDateTime: string | null;
  value: BookingSubscriptionSelection;
  onChange: (value: BookingSubscriptionSelection) => void;
}

function blockReasonMessage(reason: string | null | undefined) {
  switch (reason) {
    case "PERIOD_LIMIT_REACHED":
      return "Limite atingido neste periodo.";
    case "WEEKDAY_NOT_ALLOWED":
      return "Este plano nao permite esse dia.";
    case "SERVICE_NOT_INCLUDED":
      return "Este plano nao inclui esse servico.";
    case "CUSTOMER_HAS_NO_ACTIVE_SUBSCRIPTION":
    case "CUSTOMER_NOT_FOUND":
      return "Cliente sem assinatura ativa.";
    case "PLAN_INACTIVE":
      return "Plano inativo.";
    case "SUBSCRIPTION_NOT_ACTIVE":
    case "SUBSCRIPTION_EXPIRED":
      return "Assinatura nao esta ativa.";
    case "SUBSCRIPTION_MODULE_DISABLED":
      return "Clube desativado.";
    default:
      return "Nao foi possivel usar a assinatura para este horario.";
  }
}

export function BookingSubscriptionOption({
  enabled,
  serviceId,
  startDateTime,
  value,
  onChange,
}: BookingSubscriptionOptionProps) {
  const validateMutation = useValidateSubscriptionUsageMutation();
  const [validation, setValidation] = useState<ValidateSubscriptionUsageResponse | null>(null);

  if (!enabled) {
    return null;
  }

  async function handleValidate() {
    if (!serviceId || !startDateTime || !value.customerPhone.trim()) {
      return;
    }

    setValidation(null);
    const result = await validateMutation.mutateAsync({
      customerPhone: value.customerPhone.trim(),
      serviceId,
      startDateTime,
    });
    setValidation(result);
    onChange({
      ...value,
      useSubscription: result.allowed,
      customerSubscriptionId: result.customerSubscription?.id,
      subscriptionPlanId: result.plan?.id,
    });
  }

  const errorMessage =
    validateMutation.error instanceof ApiError
      ? validateMutation.error.message
      : validateMutation.isError
        ? "Nao foi possivel validar assinatura."
        : null;
  const blockedMessage = validation && !validation.allowed
    ? validation.message ?? blockReasonMessage(validation.blockReason)
    : null;

  return (
    <Card variant="glass" padding="md" className="grid gap-4">
      <div>
        <CardTitle>Usar assinatura</CardTitle>
        <CardDescription className="mt-1">
          Valide por telefone antes de confirmar o booking com Clube.
        </CardDescription>
      </div>

      <label className="grid gap-2 text-sm font-semibold text-text-soft">
        Telefone do cliente
        <Input
          value={value.customerPhone}
          onChange={(event) => {
            setValidation(null);
            onChange({
              useSubscription: false,
              customerPhone: event.target.value,
            });
          }}
          placeholder="(11) 99999-9999"
          disabled={validateMutation.isPending}
        />
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => void handleValidate()}
          disabled={!value.customerPhone.trim() || !startDateTime || validateMutation.isPending}
        >
          {validateMutation.isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Validando...
            </>
          ) : (
            "Validar assinatura"
          )}
        </Button>
        <label className="flex items-center gap-2 text-sm font-semibold text-[var(--theme-text-primary)]">
          <Checkbox
            checked={value.useSubscription}
            onCheckedChange={(checked) => onChange({ ...value, useSubscription: checked })}
            disabled={!validation?.allowed}
          />
          Consumir saldo neste booking
        </label>
      </div>

      {validation?.allowed ? (
        <p className="rounded-xl border border-green-400/30 bg-green-500/10 px-3 py-2 text-sm text-green-100">
          {validation.plan?.name ?? "Assinatura ativa"}: saldo {validation.availableBalance} de{" "}
          {validation.quantityLimit} neste periodo.
        </p>
      ) : null}

      {blockedMessage ? (
        <p className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100" role="alert">
          {blockedMessage}
        </p>
      ) : null}

      {errorMessage ? (
        <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </Card>
  );
}
