import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/flow/button";
import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import { Input } from "@/components/flow/input";
import { FeedbackBanner } from "@/components/shared/feedback-banner";
import { ApiError } from "@/types/api";
import type { CreateProfessionalInput } from "@/types/professional";

interface ProfessionalCreateFormProps {
  onSubmit: (input: CreateProfessionalInput) => Promise<void>;
  isSubmitting: boolean;
}

const initialForm = {
  name: "",
};

export function ProfessionalCreateForm({
  onSubmit,
  isSubmitting,
}: ProfessionalCreateFormProps) {
  const [form, setForm] = useState(initialForm);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const nameId = useId();
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await onSubmit(form);
      setForm(initialForm);
      setSuccessMessage("Profissional criado e adicionado na listagem atual.");
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "Nao foi possivel criar o profissional."
      );
    }
  }

  return (
    <Card variant="premium" padding="lg" className="h-full">
      <div className="flex items-start justify-between gap-4">
        <div>
          <CardTitle>Novo profissional</CardTitle>
          <CardDescription className="mt-3">
            O cadastro agora usa o backend real disponivel em
            `POST /professionals` e mantem o frontend sem regra operacional
            extra.
          </CardDescription>
        </div>
      </div>

      <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
        <label className="grid gap-2" htmlFor={nameId}>
          <span className="text-sm font-semibold text-white">Nome completo</span>
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
            placeholder="Ex.: Camila Rodrigues"
            required
            disabled={isSubmitting}
          />
        </label>

        {errorMessage ? (
          <FeedbackBanner
            title="Falha ao criar profissional"
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
            {isSubmitting ? "Salvando..." : "Criar profissional"}
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
