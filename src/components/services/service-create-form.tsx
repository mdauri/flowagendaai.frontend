import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/flow/button";
import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import { Input } from "@/components/flow/input";
import { FeedbackBanner } from "@/components/shared/feedback-banner";
import { ApiError } from "@/types/api";
import type { CreateServiceInput } from "@/types/service";

interface ServiceCreateFormProps {
  onSubmit: (input: CreateServiceInput) => Promise<void>;
  isSubmitting: boolean;
}

const initialForm = {
  name: "",
  durationInMinutes: "",
};

export function ServiceCreateForm({
  onSubmit,
  isSubmitting,
}: ServiceCreateFormProps) {
  const [form, setForm] = useState(initialForm);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const nameId = useId();
  const durationInMinutesId = useId();
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const parsedDurationInMinutes = Number(form.durationInMinutes);

    if (!Number.isInteger(parsedDurationInMinutes) || parsedDurationInMinutes <= 0) {
      setErrorMessage("Informe uma duracao valida em minutos maior que zero.");
      return;
    }

    try {
      await onSubmit({
        name: form.name,
        durationInMinutes: parsedDurationInMinutes,
      });
      setForm(initialForm);
      setSuccessMessage("Servico criado e adicionado na listagem atual.");
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "Nao foi possivel criar o servico. Tente novamente em instantes."
      );
    }
  }

  return (
    <Card variant="premium" padding="lg" className="h-full">
      <div>
        <CardTitle>Novo servico</CardTitle>
        <CardDescription className="mt-3">
          O cadastro agora usa o backend real em `POST /services`, mantendo a
          tela focada no fluxo operacional minimo, sem regra adicional no
          frontend.
        </CardDescription>
      </div>

      <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
        <label className="grid gap-2" htmlFor={nameId}>
          <span className="text-sm font-semibold text-white">Nome do servico</span>
          <Input
            id={nameId}
            name="name"
            inputSize="md"
            value={form.name}
            onChange={(event) => {
              setForm((current) => ({
                ...current,
                name: event.target.value,
              }));
            }}
            placeholder="Ex.: Corte tradicional"
            required
            disabled={isSubmitting}
          />
        </label>

        <label className="grid gap-2" htmlFor={durationInMinutesId}>
          <span className="text-sm font-semibold text-white">Duracao em minutos</span>
          <Input
            id={durationInMinutesId}
            name="durationInMinutes"
            type="number"
            min={1}
            step={1}
            inputSize="md"
            value={form.durationInMinutes}
            onChange={(event) => {
              setForm((current) => ({
                ...current,
                durationInMinutes: event.target.value,
              }));
            }}
            placeholder="Ex.: 60"
            required
            disabled={isSubmitting}
          />
          <p className="text-sm leading-6 text-text-soft">
            Campo obrigatorio. Use minutos inteiros maiores que zero.
          </p>
        </label>

        {errorMessage ? (
          <FeedbackBanner
            title="Falha ao criar servico"
            description={errorMessage}
          />
        ) : null}

        {successMessage ? (
          <FeedbackBanner
            title="Criacao concluida"
            description={successMessage}
            tone="info"
          />
        ) : null}

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <Button type="submit" size="md" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Criar servico"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="md"
            disabled={isSubmitting}
            onClick={() => {
              setForm(initialForm);
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
          >
            Limpar
          </Button>
        </div>
      </form>
    </Card>
  );
}
