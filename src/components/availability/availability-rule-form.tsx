import { useEffect, useId, useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/flow/button";
import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import { Input } from "@/components/flow/input";
import { Select } from "@/components/flow/select";
import { FeedbackBanner } from "@/components/shared/feedback-banner";
import { ApiError } from "@/types/api";
import type {
  AvailabilityDayOfWeek,
  CreateAvailabilityBaseInput,
  UpdateAvailabilityBaseInput,
} from "@/types/base-availability";

interface AvailabilityRuleFormProps {
  professionalId: string | null;
  mode: "create" | "edit";
  initialValues?: {
    id?: string;
    dayOfWeek: AvailabilityDayOfWeek;
    startTime: string;
    endTime: string;
  };
  isSubmitting: boolean;
  onSubmit: (input: CreateAvailabilityBaseInput | UpdateAvailabilityBaseInput) => Promise<void>;
  onCancelEdit?: () => void;
}

const dayOptions = [
  { value: "monday", label: "Segunda-feira" },
  { value: "tuesday", label: "Terca-feira" },
  { value: "wednesday", label: "Quarta-feira" },
  { value: "thursday", label: "Quinta-feira" },
  { value: "friday", label: "Sexta-feira" },
  { value: "saturday", label: "Sabado" },
  { value: "sunday", label: "Domingo" },
] as const;

const initialForm = {
  id: undefined as string | undefined,
  dayOfWeek: "" as AvailabilityDayOfWeek | "",
  startTime: "",
  endTime: "",
};

export function AvailabilityRuleForm({
  professionalId,
  mode,
  initialValues,
  isSubmitting,
  onSubmit,
  onCancelEdit,
}: AvailabilityRuleFormProps) {
  const [form, setForm] = useState(initialForm);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const dayId = useId();
  const startTimeId = useId();
  const endTimeId = useId();

  useEffect(() => {
    if (initialValues) {
      setForm({
        id: initialValues.id,
        dayOfWeek: initialValues.dayOfWeek,
        startTime: initialValues.startTime,
        endTime: initialValues.endTime,
      });
      setErrorMessage(null);
      setSuccessMessage(null);
      return;
    }

    setForm(initialForm);
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [initialValues, professionalId]);

  const disabled = !professionalId || isSubmitting;

  const title = mode === "edit" ? "Editar regra" : "Nova regra recorrente";
  const description =
    mode === "edit"
      ? "Atualize dia e intervalo desta regra sem inferir agenda futura no frontend."
      : "Crie uma regra simples por dia da semana e intervalo de horario.";

  const submitLabel = mode === "edit" ? "Salvar alteracoes" : "Criar regra";

  const validationMessage = useMemo(() => {
    if (!form.dayOfWeek) {
      return "Selecione um dia da semana.";
    }

    if (!form.startTime) {
      return "Informe o horario inicial.";
    }

    if (!form.endTime) {
      return "Informe o horario final.";
    }

    if (form.endTime <= form.startTime) {
      return "O horario final deve ser maior que o horario inicial.";
    }

    return null;
  }, [form.dayOfWeek, form.endTime, form.startTime]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (validationMessage || !form.dayOfWeek || !professionalId) {
      setErrorMessage(validationMessage ?? "Selecione um profissional para continuar.");
      return;
    }

    try {
      if (mode === "edit" && form.id) {
        await onSubmit({
          id: form.id,
          dayOfWeek: form.dayOfWeek,
          startTime: form.startTime,
          endTime: form.endTime,
        });
        setSuccessMessage("Regra atualizada com sucesso.");
        return;
      }

      await onSubmit({
        dayOfWeek: form.dayOfWeek,
        startTime: form.startTime,
        endTime: form.endTime,
      });
      setForm(initialForm);
      setSuccessMessage("Regra criada com sucesso.");
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setErrorMessage("Ja existe uma disponibilidade conflitante para este profissional.");
        return;
      }

      setErrorMessage(error instanceof ApiError ? error.message : "Nao foi possivel salvar a regra.");
    }
  }

  return (
    <Card variant="premium" padding="lg" className="h-full">
      <div>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="mt-3">{description}</CardDescription>
      </div>

      <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
        <label className="grid gap-2" htmlFor={dayId}>
          <span className="text-sm font-semibold text-white">Dia da semana</span>
          <Select
            id={dayId}
            value={form.dayOfWeek}
            options={dayOptions.map((option) => ({ value: option.value, label: option.label }))}
            placeholder="Selecione um dia da semana"
            disabled={disabled}
            onValueChange={(value) => {
              setForm((current) => ({
                ...current,
                dayOfWeek: value as AvailabilityDayOfWeek | "",
              }));
            }}
          />
        </label>

        <label className="grid gap-2" htmlFor={startTimeId}>
          <span className="text-sm font-semibold text-white">Horario inicial</span>
          <Input
            id={startTimeId}
            type="time"
            value={form.startTime}
            disabled={disabled}
            onChange={(event) => {
              setForm((current) => ({
                ...current,
                startTime: event.target.value,
              }));
            }}
          />
        </label>

        <label className="grid gap-2" htmlFor={endTimeId}>
          <span className="text-sm font-semibold text-white">Horario final</span>
          <Input
            id={endTimeId}
            type="time"
            value={form.endTime}
            disabled={disabled}
            onChange={(event) => {
              setForm((current) => ({
                ...current,
                endTime: event.target.value,
              }));
            }}
          />
        </label>

        {errorMessage ? (
          <FeedbackBanner title="Falha ao salvar disponibilidade" description={errorMessage} />
        ) : null}

        {successMessage ? (
          <FeedbackBanner title="Operacao concluida" description={successMessage} tone="info" />
        ) : null}

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <Button type="submit" size="md" disabled={disabled}>
            {isSubmitting ? "Salvando..." : submitLabel}
          </Button>
          {mode === "edit" ? (
            <Button
              type="button"
              variant="secondary"
              size="md"
              disabled={disabled}
              onClick={() => {
                onCancelEdit?.();
              }}
            >
              Cancelar edicao
            </Button>
          ) : (
            <Button
              type="button"
              variant="secondary"
              size="md"
              disabled={disabled}
              onClick={() => {
                setForm(initialForm);
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
            >
              Limpar
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
