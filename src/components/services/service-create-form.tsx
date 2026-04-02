import {
  ChangeEvent,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { Button } from "@/components/flow/button";
import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import { Input } from "@/components/flow/input";
import { Textarea } from "@/components/flow/textarea";
import { FeedbackBanner } from "@/components/shared/feedback-banner";
import { PriceInput } from "@/components/services/price-input";
import { servicesService } from "@/services/services-service";
import { ApiError } from "@/types/api";
import type {
  CreateServiceInput,
  CreateServiceResponse,
} from "@/types/service";

const initialForm = {
  name: "",
  description: "",
  durationInMinutes: "",
  price: "",
};

const IMAGE_MAX_SIZE = 5 * 1024 * 1024; // 5MB
const IMAGE_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface ServiceCreateFormProps {
  onSubmit: (input: CreateServiceInput) => Promise<CreateServiceResponse>;
  isSubmitting: boolean;
}

function validateImageFile(file: File): string | null {
  if (!IMAGE_ALLOWED_TYPES.includes(file.type)) {
    return "Formato inválido. Use JPG, PNG ou WebP.";
  }

  if (file.size > IMAGE_MAX_SIZE) {
    return "Arquivo muito grande. Tamanho máximo: 5MB.";
  }

  return null;
}

export function ServiceCreateForm({
  onSubmit,
  isSubmitting,
}: ServiceCreateFormProps) {
  const [form, setForm] = useState(initialForm);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);
  const [imageSelectionError, setImageSelectionError] = useState<string | null>(
    null,
  );
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const nameId = useId();
  const descriptionId = useId();
  const durationInMinutesId = useId();
  const priceId = useId();

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const handleImageSelection = (file: File | null) => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    if (!file) {
      setSelectedImageFile(null);
      setImagePreviewUrl(null);
      return;
    }

    setSelectedImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
    setImageSelectionError(null);
    setImageUploadError(null);
  };

  const handleImageInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";

    if (!file) {
      handleImageSelection(null);
      return;
    }

    const validationError = validateImageFile(file);

    if (validationError) {
      handleImageSelection(null);
      setImageSelectionError(validationError);
      return;
    }

    handleImageSelection(file);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleImageRemove = () => {
    handleImageSelection(null);
    setImageSelectionError(null);
    setImageUploadError(null);
  };

  const uploadSelectedImage = async (serviceId: string, file: File) => {
    setIsImageUploading(true);
    setImageUploadProgress(10);

    try {
      const resp = await servicesService.requestUploadUrl(serviceId, {
        filename: file.name,
        contentType: file.type,
      });

      console.log(resp);

      const { uploadUrl, imageUrl } = await servicesService.requestUploadUrl(
        serviceId,
        {
          filename: file.name,
          contentType: file.type,
        },
      );

      console.log(uploadUrl, imageUrl);

      setImageUploadProgress(40);

      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      setImageUploadProgress(80);

      console.log(
        "service-create-form serviceId: ",
        serviceId,
        " imageUrl: ",
        imageUrl,
      );

      await servicesService.confirmUpload(serviceId, imageUrl);
      setImageUploadProgress(100);

      return imageUrl;
    } finally {
      setIsImageUploading(false);
      setImageUploadProgress(0);
    }
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setImageUploadError(null);

    const parsedDurationInMinutes = Number(form.durationInMinutes);
    const parsedPrice = parseFloat(form.price.replace(",", "."));

    if (
      !Number.isInteger(parsedDurationInMinutes) ||
      parsedDurationInMinutes <= 0
    ) {
      setErrorMessage("Informe uma duracao valida em minutos maior que zero.");
      return;
    }

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setErrorMessage("Informe um preco valido maior que zero.");
      return;
    }

    const pendingImage = selectedImageFile;

    try {
      const createResult = await onSubmit({
        name: form.name,
        description: form.description.trim() === "" ? null : form.description,
        durationInMinutes: parsedDurationInMinutes,
        price: parsedPrice,
      });

      setForm(initialForm);
      setCharCount(0);

      const serviceId = createResult.service.id;
      let successMessage = "Servico criado e adicionado na listagem atual.";

      if (pendingImage) {
        try {
          await uploadSelectedImage(serviceId, pendingImage);
          handleImageSelection(null);
          successMessage = "Servico e imagem adicionados na listagem atual.";
        } catch (uploadError) {
          const message =
            uploadError instanceof ApiError
              ? uploadError.message
              : "Nao foi possivel enviar a imagem. Tente novamente.";
          setImageUploadError(message);
        }
      }

      setSuccessMessage(successMessage);
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "Nao foi possivel criar o servico. Tente novamente em instantes.",
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
        <div className="grid gap-2">
          <span className="text-sm font-semibold text-white">
            Imagem do servico (opcional)
          </span>
          <div
            className="relative flex h-48 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4"
            aria-label="Pré-visualização da imagem"
          >
            {imagePreviewUrl ? (
              <img
                src={imagePreviewUrl}
                alt="Pré-visualização do serviço"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-center text-sm text-text-soft">
                <p>Selecione uma imagem JPG, PNG ou WebP de até 5MB.</p>
                <p>
                  Ela será enviada automaticamente após o serviço ser criado.
                </p>
              </div>
            )}
            <button
              type="button"
              className="absolute inset-0"
              onClick={openFileDialog}
              disabled={isImageUploading || isSubmitting}
              aria-label="Selecionar imagem do serviço"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-white">
            <button
              type="button"
              className="rounded-lg border border-white/30 px-4 py-2 text-sm font-semibold transition hover:border-white/70"
              onClick={openFileDialog}
              disabled={isImageUploading || isSubmitting}
            >
              {selectedImageFile ? "Trocar arquivo" : "Selecionar arquivo"}
            </button>
            {selectedImageFile && (
              <button
                type="button"
                className="rounded-lg border border-white/30 px-4 py-2 text-sm font-semibold transition hover:border-white/70"
                onClick={handleImageRemove}
                disabled={isImageUploading}
              >
                Remover
              </button>
            )}
            <span className="text-xs text-text-soft">
              {selectedImageFile
                ? selectedImageFile.name
                : "JPG/PNG/WebP · max 5MB"}
            </span>
          </div>

          {imageSelectionError ? (
            <p className="text-xs text-warning">{imageSelectionError}</p>
          ) : null}

          {isImageUploading && (
            <p className="text-xs text-text-soft">
              Enviando imagem...{" "}
              {Math.min(100, Math.max(0, Math.round(imageUploadProgress)))}%
            </p>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={IMAGE_ALLOWED_TYPES.join(",")}
          className="hidden"
          onChange={handleImageInputChange}
        />

        <label className="grid gap-2" htmlFor={nameId}>
          <span className="text-sm font-semibold text-white">
            Nome do servico
          </span>
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
            disabled={isSubmitting || isImageUploading}
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
            disabled={isSubmitting || isImageUploading}
            required
            placeholder="R$ 0,00"
          />
        </label>

        <label className="grid gap-2" htmlFor={descriptionId}>
          <span className="text-sm font-semibold text-white">
            Descricao (opcional)
          </span>
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
            disabled={isSubmitting || isImageUploading}
          />
          <div className="flex items-center justify-between">
            <p className="text-sm leading-6 text-text-soft">
              Informe detalhes do servico para ajudar os clientes a entender o
              que estao agendando.
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
          <span className="text-sm font-semibold text-white">
            Duracao em minutos
          </span>
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
            disabled={isSubmitting || isImageUploading}
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

        {imageUploadError ? (
          <FeedbackBanner
            title="Falha no upload da imagem"
            description={imageUploadError}
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
          <Button
            type="submit"
            size="md"
            disabled={isSubmitting || charCount > 1000 || isImageUploading}
          >
            {isSubmitting || isImageUploading ? "Salvando..." : "Criar servico"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="md"
            disabled={isSubmitting || isImageUploading}
            onClick={() => {
              setForm(initialForm);
              setErrorMessage(null);
              setSuccessMessage(null);
              setCharCount(0);
              handleImageSelection(null);
              setImageSelectionError(null);
              setImageUploadError(null);
            }}
          >
            Limpar
          </Button>
        </div>
      </form>
    </Card>
  );
}
