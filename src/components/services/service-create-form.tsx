import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/flow/button";
import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import { Input } from "@/components/flow/input";
import { Textarea } from "@/components/flow/textarea";
import { FeedbackBanner } from "@/components/shared/feedback-banner";
import { ServiceImageUpload } from "@/components/services/service-image-upload";
import { PriceInput } from "@/components/services/price-input";
import { ApiError } from "@/types/api";
import type { CreateServiceInput } from "@/types/service";

interface ServiceCreateFormProps {
  onSubmit: (input: CreateServiceInput) => Promise<void>;
  isSubmitting: boolean;
}

const initialForm = {
  name: "",
  description: "",
  durationInMinutes: "",
  price: "",
};

export function ServiceCreateForm({
  onSubmit,
  isSubmitting,
}: ServiceCreateFormProps) {
  const [form, setForm] = useState(initialForm);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const nameId = useId();
  const descriptionId = useId();
  const durationInMinutesId = useId();
  const priceId = useId();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const parsedDurationInMinutes = Number(form.durationInMinutes);
    const parsedPrice = parseFloat(form.price.replace(",", "."));

    if (!Number.isInteger(parsedDurationInMinutes) || parsedDurationInMinutes <= 0) {
      setErrorMessage("Informe uma duracao valida em minutos maior que zero.");
      return;
    }

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setErrorMessage("Informe um preco valido maior que zero.");
      return;
    }

    try {
      await onSubmit({
        name: form.name,
        description: form.description.trim() === "" ? null : form.description,
        durationInMinutes: parsedDurationInMinutes,
        price: parsedPrice,
        imageUrl: imageUrl ?? null,
      });
      setForm(initialForm);
      setCharCount(0);
      setImageUrl(null);
      setSuccessMessage("Servico criado e adicionado na listagem atual.");
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "Nao foi possivel criar o servico. Tente novamente em instantes."
      );
    }
  }

  const handleImageUploadComplete = (uploadedImageUrl: string) => {
    setImageUrl(uploadedImageUrl || null);
  };

  const handleImageUploadError = () => {
    // Image upload error is handled within the component
  };

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
        {/* Image Upload */}
        <div className="grid gap-2">
          <span className="text-sm font-semibold text-white">Imagem do servico (opcional)</span>
          <ServiceImageUpload
            serviceId="new"
            currentImageUrl={imageUrl}
            onUploadComplete={handleImageUploadComplete}
            onUploadError={handleImageUploadError}
          />
        </div>

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

        <label className="grid gap-2" htmlFor={priceId}>
          <span className="text-sm font-semibold text-white">Preco</span>
          <PriceInput
            value={form.price ? parseFloat(form.price.replace(",", ".")) : null}
            onChange={(value) => {
              setForm((current) => ({
                ...current,
                price: value !== null ? value.toString() : "",
              }));
            }}
            disabled={isSubmitting}
            required
            placeholder="R$ 0,00"
          />
        </label>

        <label className="grid gap-2" htmlFor={descriptionId}>
          <span className="text-sm font-semibold text-white">Descricao (opcional)</span>
          <Textarea
            id={descriptionId}
            name="description"
            value={form.description}
            onChange={(event) => {
              const value = event.target.value;
              setForm((current) => ({
                ...current,
                description: value,
              }));
              setCharCount(value.length);
            }}
            placeholder="Descreva o que esta incluso no servico, prerequisitos, ou outras informacoes relevantes."
            maxLength={1000}
            rows={4}
            disabled={isSubmitting}
          />
          <div className="flex items-center justify-between">
            <p className="text-sm leading-6 text-text-soft">
              Informe detalhes do servico para ajudar os clientes a entender o que estao agendando.
            </p>
            <span
              className={`text-sm font-medium ${
                charCount >= 900 ? "text-warning" : "text-text-soft"
              }`}
            >
              {charCount}/1000
            </span>
          </div>
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
          <Button type="submit" size="md" disabled={isSubmitting || charCount > 1000}>
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
              setCharCount(0);
              setImageUrl(null);
            }}
          >
            Limpar
          </Button>
        </div>
      </form>
    </Card>
  );
}
