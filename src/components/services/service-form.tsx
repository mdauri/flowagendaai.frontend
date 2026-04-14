import {
  ChangeEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type DragEvent,
  type FormEvent,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/flow/button";
import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import { Input } from "@/components/flow/input";
import { Textarea } from "@/components/flow/textarea";
import { FeedbackBanner } from "@/components/shared/feedback-banner";
import { PriceInput } from "@/components/services/price-input";
import { DurationHelper } from "@/components/services/duration-helper";
import { ServiceImageUpload } from "@/components/services/service-image-upload";
import { servicesService } from "@/services/services-service";
import { ApiError } from "@/types/api";
import type {
  CreateServiceInput,
  CreateServiceResponse,
  ListServicesResponse,
  Service,
  UpdateServiceInput,
  UpdateServiceResponse,
} from "@/types/service";

const initialForm = {
  name: "",
  description: "",
  durationInMinutes: "",
  price: "",
  isActive: true,
};

const IMAGE_MAX_SIZE = 5 * 1024 * 1024; // 5MB
const IMAGE_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface ServiceCreateProps {
  onSubmit: (input: CreateServiceInput) => Promise<CreateServiceResponse>;
  isSubmitting: boolean;
}

interface ServiceEditFormProps {
  mode: "edit";
  initialValues: Service;
  onSubmit: (input: UpdateServiceInput) => Promise<UpdateServiceResponse>;
  onCancelEdit: () => void;
  isSubmitting: boolean;
}

interface ServiceCreateModeProps extends ServiceCreateProps {
  mode?: "create";
}

export type ServiceFormProps = ServiceCreateModeProps | ServiceEditFormProps;

function validateImageFile(file: File): string | null {
  if (!IMAGE_ALLOWED_TYPES.includes(file.type)) {
    return "Formato inválido. Use JPG, PNG ou WebP.";
  }

  if (file.size > IMAGE_MAX_SIZE) {
    return "Arquivo muito grande. Tamanho máximo: 5MB.";
  }

  return null;
}

function getFormFromService(service: Service | null) {
  return {
    name: service?.name ?? "",
    description: service?.description ?? "",
    durationInMinutes: service ? String(service.durationInMinutes) : "",
    price: service ? String(service.price) : "",
    isActive: service?.isActive ?? true,
  };
}

export function ServiceForm(props: ServiceFormProps) {
  const queryClient = useQueryClient();
  const isEditMode = props.mode === "edit";
  const createProps = props as ServiceCreateModeProps;
  const editProps = isEditMode ? (props as ServiceEditFormProps) : null;
  const editService = editProps?.initialValues ?? null;

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
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const nameId = useId();
  const descriptionId = useId();
  const durationInMinutesId = useId();
  const priceId = useId();
  const activeId = useId();

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  useEffect(() => {
    if (editService) {
      setForm(getFormFromService(editService));
      setCharCount((editService.description ?? "").length);
      setErrorMessage(null);
      setSuccessMessage(null);
      setImageSelectionError(null);
      setImageUploadError(null);
      setSelectedImageFile(null);
      setImagePreviewUrl(null);
      setIsImageUploading(false);
      setImageUploadProgress(0);
      setIsDraggingImage(false);
      nameInputRef.current?.focus();
      return;
    }

    setForm(initialForm);
    setCharCount(0);
    setErrorMessage(null);
    setSuccessMessage(null);
    setImageSelectionError(null);
    setImageUploadError(null);
    setSelectedImageFile(null);
    setImagePreviewUrl(null);
    setIsImageUploading(false);
    setImageUploadProgress(0);
    setIsDraggingImage(false);
  }, [editService]);

  if (isEditMode && !editService) {
    return null;
  }

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

  const handleImageFile = (file: File | null) => {
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

  const handleImageInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";
    handleImageFile(file);
  };

  const handleImageDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingImage(true);
  };

  const handleImageDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isDraggingImage) {
      setIsDraggingImage(true);
    }
  };

  const handleImageDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingImage(false);
  };

  const handleImageDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingImage(false);
    handleImageFile(event.dataTransfer.files?.[0] ?? null);
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
      const { uploadUrl, objectKey, imageUrl } =
        await servicesService.requestUploadUrl(serviceId, {
          filename: file.name,
          contentType: file.type,
        });

      setImageUploadProgress(40);

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Falha ao enviar a imagem para o storage.");
      }

      setImageUploadProgress(80);

      const confirmedUpload = await servicesService.confirmUpload(
        serviceId,
        objectKey,
      );
      setImageUploadProgress(100);

      return {
        imageUrl: confirmedUpload.imageUrl ?? imageUrl,
        thumbnailUrl: confirmedUpload.thumbnailUrl,
      };
    } finally {
      setIsImageUploading(false);
      setImageUploadProgress(0);
    }
  };

  const canSave = useMemo(() => {
    const trimmedName = form.name.trim();
    const parsedDuration = Number(form.durationInMinutes);
    const parsedPrice = Number.parseFloat(form.price.replace(",", "."));

    return (
      trimmedName.length >= 2 &&
      trimmedName.length <= 120 &&
      form.description.length <= 1000 &&
      Number.isInteger(parsedDuration) &&
      parsedDuration > 0 &&
      parsedDuration <= 4320 &&
      Number.isFinite(parsedPrice) &&
      parsedPrice > 0 &&
      parsedPrice <= 99999.99
    );
  }, [form.description.length, form.durationInMinutes, form.name, form.price]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setImageUploadError(null);

    const parsedDurationInMinutes = Number(form.durationInMinutes);
    const parsedPrice = Number.parseFloat(form.price.replace(",", "."));

    if (
      !Number.isInteger(parsedDurationInMinutes) ||
      parsedDurationInMinutes <= 0
    ) {
      setErrorMessage("Informe uma duracao valida em minutos maior que zero.");
      return;
    }

    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      setErrorMessage("Informe um preco valido maior que zero.");
      return;
    }

    if (isEditMode) {
      try {
        await editProps!.onSubmit({
          name: form.name.trim(),
          description: form.description.trim() === "" ? null : form.description,
          durationInMinutes: parsedDurationInMinutes,
          price: parsedPrice,
          isActive: form.isActive,
        });

        editProps!.onCancelEdit();
      } catch (error) {
        setErrorMessage(
          error instanceof ApiError
            ? error.message
            : "Nao foi possivel salvar o servico.",
        );
      }

      return;
    }

    const pendingImage = selectedImageFile;

    try {
      const createResult = await createProps.onSubmit({
        name: form.name.trim(),
        description: form.description.trim() === "" ? null : form.description,
        durationInMinutes: parsedDurationInMinutes,
        price: parsedPrice,
      });

      setForm(initialForm);
      setCharCount(0);

      const serviceId = createResult.service.id;
      let nextSuccessMessage = "Servico criado e adicionado na listagem atual.";

      if (pendingImage) {
        try {
          const uploaded = await uploadSelectedImage(serviceId, pendingImage);

          queryClient.setQueryData<ListServicesResponse>(
            ["services"],
            (current) => {
              if (!current) return current;
              return {
                ...current,
                services: current.services.map((service) => {
                  if (service.id !== serviceId) return service;
                  return {
                    ...service,
                    imageUrl: uploaded.imageUrl,
                    thumbnailUrl: uploaded.thumbnailUrl,
                  };
                }),
              };
            },
          );

          await queryClient.invalidateQueries({ queryKey: ["services"] });

          handleImageSelection(null);
          nextSuccessMessage =
            "Servico e imagem adicionados na listagem atual.";
        } catch (uploadError) {
          const message =
            uploadError instanceof ApiError
              ? uploadError.message
              : "Nao foi possivel enviar a imagem. Tente novamente.";
          setImageUploadError(message);
        }
      }

      setSuccessMessage(nextSuccessMessage);
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <CardTitle>
            {isEditMode ? "Editar servico" : "Novo servico"}
          </CardTitle>
          <CardDescription className="mt-3">
            {isEditMode
              ? "Atualize os dados operacionais do servico dentro do tenant atual."
              : "O cadastro agora usa o backend real em `POST /services`, mantendo a tela focada no fluxo operacional minimo, sem regra adicional no frontend."}
          </CardDescription>
        </div>
      </div>

      <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
        <div className="grid gap-5">
          <label className="grid gap-2" htmlFor={nameId}>
            <span className="text-sm font-semibold text-white">
              Nome do servico
            </span>
            <Input
              ref={nameInputRef}
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
              disabled={props.isSubmitting}
            />
          </label>

          <label className="grid gap-2" htmlFor={descriptionId}>
            <div className="flex items-end justify-between gap-4">
              <span className="text-sm font-semibold text-white">
                Descricao (opcional)
              </span>
              <span className="text-xs text-text-soft">{charCount}/1000</span>
            </div>
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
              disabled={props.isSubmitting}
            />
            <div className="flex items-center justify-between">
              <p className="text-sm leading-6 text-text-soft">
                Informe detalhes do servico para ajudar os clientes a entender o
                que estao agendando.
              </p>
              <span
                className={`text-sm font-medium ${charCount >= 900 ? "text-warning" : "text-text-soft"}`}
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
              disabled={props.isSubmitting}
            />
            <DurationHelper durationInMinutes={Number(form.durationInMinutes)} />
            <p className="text-sm leading-6 text-text-soft">
              Campo obrigatorio. Use minutos inteiros maiores que zero. Maximo 4320 minutos (72 horas).
            </p>
          </label>

          <label className="grid gap-2" htmlFor={priceId}>
            <span className="text-sm font-semibold text-white">Preco</span>
            <PriceInput
              value={
                form.price
                  ? Number.parseFloat(form.price.replace(",", "."))
                  : null
              }
              onChange={(value) => {
                setForm((current) => ({
                  ...current,
                  price: value !== null ? value.toString() : "",
                }));
              }}
              disabled={props.isSubmitting}
              required
              placeholder="R$ 0,00"
            />
          </label>
        </div>

        {isEditMode ? (
          <div className="grid gap-5">
            <label
              className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
              htmlFor={activeId}
            >
              <input
                id={activeId}
                type="checkbox"
                checked={form.isActive}
                onChange={(event) => {
                  setForm((current) => ({
                    ...current,
                    isActive: event.target.checked,
                  }));
                }}
                disabled={props.isSubmitting}
                className="mt-1 h-4 w-4"
              />
              <div className="grid gap-1">
                <span className="text-sm font-semibold text-white">
                  Servico ativo
                </span>
                <span className="text-xs text-text-soft">
                  Servicos inativos nao podem ser associados a profissionais.
                </span>
              </div>
            </label>

            <div className="grid gap-2">
              <span className="text-sm font-semibold text-white">Imagem</span>
              <ServiceImageUpload
                key={editService!.id}
                serviceId={editService!.id}
                currentImageUrl={editService!.imageUrl ?? null}
                onUploadComplete={async () => {
                  setImageUploadError(null);
                  await queryClient.invalidateQueries({
                    queryKey: ["services"],
                  });
                }}
                onUploadError={(error) => {
                  setImageUploadError(
                    error instanceof ApiError
                      ? error.message
                      : error.message || "Falha ao atualizar a imagem.",
                  );
                }}
              />
            </div>
          </div>
        ) : (
          <div className="grid gap-2">
            <span className="text-sm font-semibold text-white">
              Imagem do servico (opcional)
            </span>
            <div
              className={`relative flex h-48 items-center justify-center overflow-hidden rounded-2xl border p-4 transition-colors ${
                isDraggingImage
                  ? "border-(--drag-border) bg-(--drag-surface)"
                  : "border-white/10 bg-white/5"
              }`}
              aria-label="Pré-visualização da imagem"
              onDragEnter={handleImageDragEnter}
              onDragOver={handleImageDragOver}
              onDragLeave={handleImageDragLeave}
              onDrop={handleImageDrop}
              style={
                {
                  "--drag-border": "rgba(255, 138, 61, 0.9)",
                  "--drag-surface": "rgba(255, 138, 61, 0.08)",
                } as CSSProperties
              }
            >
              {imagePreviewUrl ? (
                <img
                  src={imagePreviewUrl}
                  alt="Pré-visualização do serviço"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-center text-sm text-text-soft">
                  <p>
                    {isDraggingImage
                      ? "Solte a imagem para carregar a pré-visualização."
                      : "Arraste e solte ou selecione uma imagem JPG, PNG ou WebP de até 5MB."}
                  </p>
                  <p>
                    Ela será enviada automaticamente após o serviço ser criado.
                  </p>
                </div>
              )}
              <button
                type="button"
                className="absolute inset-0"
                onClick={openFileDialog}
                disabled={isImageUploading || props.isSubmitting}
                aria-label="Selecionar imagem do serviço"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-white">
              <button
                type="button"
                className="rounded-lg border border-white/30 px-4 py-2 text-sm font-semibold transition hover:border-white/70"
                onClick={openFileDialog}
                disabled={isImageUploading || props.isSubmitting}
              >
                {selectedImageFile ? "Trocar arquivo" : "Selecionar arquivo"}
              </button>
              {selectedImageFile ? (
                <button
                  type="button"
                  className="rounded-lg border border-white/30 px-4 py-2 text-sm font-semibold transition hover:border-white/70"
                  onClick={handleImageRemove}
                  disabled={isImageUploading}
                >
                  Remover
                </button>
              ) : null}
              <span className="text-xs text-text-soft">
                {selectedImageFile
                  ? selectedImageFile.name
                  : "JPG/PNG/WebP · max 5MB"}
              </span>
            </div>

            {imageSelectionError ? (
              <p className="text-xs text-warning">{imageSelectionError}</p>
            ) : null}

            {isImageUploading ? (
              <p className="text-xs text-text-soft">
                Enviando imagem...{" "}
                {Math.min(100, Math.max(0, Math.round(imageUploadProgress)))}%
              </p>
            ) : null}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={IMAGE_ALLOWED_TYPES.join(",")}
          className="hidden"
          onChange={handleImageInputChange}
        />

        {errorMessage ? (
          <FeedbackBanner
            title={
              isEditMode
                ? "Falha ao salvar alteracoes"
                : "Falha ao criar servico"
            }
            description={errorMessage}
          />
        ) : null}

        {imageUploadError ? (
          <FeedbackBanner
            title={
              isEditMode
                ? "Falha ao atualizar a imagem"
                : "Falha no upload da imagem"
            }
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
            disabled={
              props.isSubmitting ||
              !canSave ||
              (!isEditMode && isImageUploading)
            }
          >
            {props.isSubmitting || (!isEditMode && isImageUploading)
              ? "Salvando..."
              : isEditMode
                ? "Salvar alteracoes"
                : "Criar servico"}
          </Button>
          {isEditMode ? (
            <Button
              type="button"
              variant="secondary"
              size="md"
              disabled={props.isSubmitting}
              onClick={() => {
                props.onCancelEdit();
              }}
            >
              Cancelar edicao
            </Button>
          ) : (
            <Button
              type="button"
              variant="secondary"
              size="md"
              disabled={props.isSubmitting || isImageUploading}
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
          )}
        </div>
      </form>
    </Card>
  );
}
