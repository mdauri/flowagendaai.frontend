import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/flow/button";
import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import { Input } from "@/components/flow/input";
import { Textarea } from "@/components/flow/textarea";
import { FeedbackBanner } from "@/components/shared/feedback-banner";
import { ProfessionalImageUpload } from "@/components/professionals/professional-image-upload";
import { professionalsService } from "@/services/professionals-service";
import { ApiError } from "@/types/api";
import type {
  CreateProfessionalInput,
  CreateProfessionalResponse,
  ListProfessionalsResponse,
  Professional,
} from "@/types/professional";

interface ProfessionalFormProps {
  mode: "create" | "edit";
  initialValues?: Professional | null;
  isSubmitting: boolean;
  onCreateSubmit: (input: CreateProfessionalInput) => Promise<CreateProfessionalResponse>;
  onEditSubmit: (
    professionalId: string,
    name: string,
    description?: string | null,
  ) => Promise<void>;
  onCancelEdit?: () => void;
  onImageUploadFailed?: (professionalId: string, file: File, message: string) => void;
  onImageUploadSucceeded?: (professionalId: string) => void;
  pendingImageRetry?: { file: File; message: string } | null;
}

const initialForm = {
  name: "",
  description: "",
};

const IMAGE_MAX_SIZE = 5 * 1024 * 1024;
const IMAGE_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function validateImageFile(file: File): string | null {
  if (!IMAGE_ALLOWED_TYPES.includes(file.type)) {
    return "Formato inválido. Use JPG, PNG ou WebP.";
  }

  if (file.size > IMAGE_MAX_SIZE) {
    return "Arquivo muito grande. Tamanho máximo: 5MB.";
  }

  return null;
}

export function ProfessionalForm({
  mode,
  initialValues,
  isSubmitting,
  onCreateSubmit,
  onEditSubmit,
  onCancelEdit,
  onImageUploadFailed,
  onImageUploadSucceeded,
  pendingImageRetry,
}: ProfessionalFormProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(initialForm);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);
  const [imageSelectionError, setImageSelectionError] = useState<string | null>(null);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const imagePreviewUrlRef = useRef<string | null>(null);

  const nameId = useId();
  const descriptionId = useId();
  const isEditMode = mode === "edit";

  const handleImageSelection = useCallback((file: File | null) => {
    if (imagePreviewUrlRef.current) {
      URL.revokeObjectURL(imagePreviewUrlRef.current);
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
  }, []);

  useEffect(() => {
    if (isEditMode && initialValues) {
      setForm({
        name: initialValues.name ?? "",
        description: initialValues.description ?? "",
      });
      setCharCount((initialValues.description ?? "").length);
      setErrorMessage(null);
      setSuccessMessage(null);
      setImageSelectionError(null);
      setImageUploadError(null);
      handleImageSelection(null);
      nameInputRef.current?.focus();
      return;
    }

    setForm(initialForm);
    setCharCount(0);
    setErrorMessage(null);
    setSuccessMessage(null);
    setImageSelectionError(null);
    setImageUploadError(null);
    handleImageSelection(null);
  }, [initialValues, isEditMode, handleImageSelection]);

  useEffect(() => {
    imagePreviewUrlRef.current = imagePreviewUrl;

    return () => {
      if (imagePreviewUrlRef.current) {
        URL.revokeObjectURL(imagePreviewUrlRef.current);
      }
    };
  }, [imagePreviewUrl]);

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

  const openFileDialog = () => {
    fileInputRef.current?.click();
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

  const handleImageRemove = () => {
    handleImageSelection(null);
    setImageSelectionError(null);
    setImageUploadError(null);
  };

  const uploadSelectedImage = async (professionalId: string, file: File) => {
    setIsImageUploading(true);
    setImageUploadProgress(10);

    try {
      const { uploadUrl, objectKey } = await professionalsService.requestImageUploadUrl(
        professionalId,
        {
          filename: file.name,
          contentType: file.type,
        },
      );

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

      const confirmedUpload = await professionalsService.confirmImageUpload(
        professionalId,
        objectKey,
      );

      setImageUploadProgress(100);

      return confirmedUpload;
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

    if (form.description.length > 1000) {
      setErrorMessage("Descricao deve ter no maximo 1000 caracteres.");
      return;
    }

    if (isEditMode) {
      if (!initialValues) {
        setErrorMessage("Selecione um profissional para continuar.");
        return;
      }

      try {
        await onEditSubmit(
          initialValues.id,
          form.name,
          form.description.trim() === "" ? null : form.description,
        );
        onCancelEdit?.();
      } catch (error) {
        setErrorMessage(
          error instanceof ApiError ? error.message : "Nao foi possivel atualizar o profissional.",
        );
      }

      return;
    }

    const pendingImage = selectedImageFile;

    try {
      const createResult = await onCreateSubmit({
        name: form.name,
        description: form.description.trim() === "" ? null : form.description,
      });

      setForm(initialForm);
      setCharCount(0);

      const professionalId = createResult.professional.id;
      let successText = "Profissional criado e adicionado na listagem atual.";

      if (pendingImage) {
        try {
          const uploaded = await uploadSelectedImage(professionalId, pendingImage);
          handleImageSelection(null);
          onImageUploadSucceeded?.(professionalId);
          successText = "Profissional criado e foto adicionada na listagem atual.";

          queryClient.setQueryData<ListProfessionalsResponse>(["professionals"], (current) => {
            if (!current) return current;
            return {
              ...current,
              professionals: current.professionals.map((professional) => {
                if (professional.id !== professionalId) return professional;
                return {
                  ...professional,
                  imageUrl: uploaded.imageUrl,
                  thumbnailUrl: uploaded.thumbnailUrl,
                };
              }),
            };
          });

          await queryClient.invalidateQueries({ queryKey: ["professionals"] });
        } catch (uploadError) {
          const message =
            uploadError instanceof ApiError
              ? uploadError.message
              : "Nao foi possivel enviar a foto. Tente novamente.";
          setImageUploadError(message);
          onImageUploadFailed?.(professionalId, pendingImage, message);
          successText = "Profissional criado, mas nao foi possivel enviar a foto.";
        }
      }

      setSuccessMessage(successText);
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError ? error.message : "Nao foi possivel criar o profissional.",
      );
    }
  }

  if (isEditMode && !initialValues) {
    return null;
  }

  const editProfessional = initialValues as Professional;

  const primaryLabel = isEditMode ? "Salvar alteracoes" : "Criar profissional";
  const primarySubmittingLabel = isEditMode ? "Salvando..." : "Criando...";
  const title = isEditMode ? "Editar profissional" : "Novo profissional";
  const description = isEditMode
    ? "Atualize os dados operacionais do profissional sem trocar de contexto."
    : "O cadastro agora usa o backend real disponivel em `POST /professionals` e mantem o frontend sem regra operacional extra.";

  const submitDisabled = isEditMode ? isSubmitting : isSubmitting || isImageUploading;
  const submitLabel = isSubmitting
    ? primarySubmittingLabel
    : !isEditMode && isImageUploading
      ? "Enviando foto..."
      : primaryLabel;

  return (
    <Card variant="premium" padding="lg" className="h-full">
      <div className="flex items-start justify-between gap-4">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription className="mt-3">{description}</CardDescription>
        </div>
      </div>

      <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
        <label className="grid gap-2" htmlFor={nameId}>
          <span className="text-sm font-semibold text-white">Nome completo</span>
          <Input
            id={nameId}
            name="name"
            ref={nameInputRef}
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
            disabled={submitDisabled}
          />
        </label>

        <label className="grid gap-2" htmlFor={descriptionId}>
          <div className="flex items-end justify-between gap-4">
            <span className="text-sm font-semibold text-white">Descricao (opcional)</span>
            <span className="text-xs text-text-soft">{charCount}/1000</span>
          </div>
          <Textarea
            id={descriptionId}
            value={form.description}
            onChange={(event) => {
              const next = event.target.value;
              setForm((current) => ({
                ...current,
                description: next,
              }));
              setCharCount(next.length);
            }}
            placeholder="Ex.: Especialista em coloracao. Atende seg-sex."
            disabled={submitDisabled}
            rows={4}
          />
        </label>

        {isEditMode ? (
          <div className="grid gap-2">
            <span className="text-sm font-semibold text-white">Foto</span>
            <ProfessionalImageUpload
              professionalId={editProfessional.id}
              currentThumbnailUrl={editProfessional.thumbnailUrl ?? null}
              currentImageUrl={editProfessional.imageUrl ?? null}
              pendingRetry={pendingImageRetry ?? null}
              onUploadComplete={async () => {
                await queryClient.invalidateQueries({ queryKey: ["professionals"] });
                onImageUploadSucceeded?.(editProfessional.id);
              }}
              onUploadError={(error, file) => {
                const message =
                  error instanceof ApiError ? error.message : error.message || "Falha ao fazer upload.";
                if (file) {
                  onImageUploadFailed?.(editProfessional.id, file, message);
                }
              }}
            />
          </div>
        ) : (
          <div className="grid gap-2">
            <span className="text-sm font-semibold text-white">Foto (opcional)</span>
            <div
              className={`relative flex aspect-square w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-all ${
                isDraggingImage ? "border-white/20 bg-white/5" : "border-white/10"
              }`}
              onClick={openFileDialog}
              onDragEnter={handleImageDragEnter}
              onDragOver={handleImageDragOver}
              onDragLeave={handleImageDragLeave}
              onDrop={handleImageDrop}
              role="button"
              tabIndex={0}
              aria-label={
                imagePreviewUrl
                  ? "Clique para trocar a foto"
                  : "Clique ou arraste para selecionar a foto"
              }
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openFileDialog();
                }
              }}
            >
              {imagePreviewUrl ? (
                <>
                  <img
                    src={imagePreviewUrl}
                    alt="Preview da foto"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition-transform hover:scale-110"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleImageRemove();
                    }}
                    aria-label="Remover foto"
                    disabled={submitDisabled}
                  >
                    X
                  </button>
                </>
              ) : (
                <div className="p-6 text-center text-sm text-text-soft">
                  Clique ou arraste uma imagem (JPG, PNG ou WebP, ate 5MB).
                </div>
              )}

              {isImageUploading ? (
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-white">
                      Enviando... {imageUploadProgress}%
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-white"
                        style={{ width: `${imageUploadProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept={IMAGE_ALLOWED_TYPES.join(",")}
              className="hidden"
              onChange={handleImageInputChange}
              disabled={submitDisabled}
            />

            {imageSelectionError ? (
              <FeedbackBanner title="Foto invalida" description={imageSelectionError} />
            ) : null}
          </div>
        )}

        {errorMessage ? (
          <FeedbackBanner
            title={isEditMode ? "Falha ao salvar alteracoes" : "Falha ao criar profissional"}
            description={errorMessage}
          />
        ) : null}

        {!isEditMode && imageUploadError ? (
          <FeedbackBanner
            title="Profissional criado, mas sem foto"
            description={imageUploadError}
            tone="info"
          />
        ) : null}

        {!isEditMode && successMessage ? (
          <FeedbackBanner
            title="Criacao concluida"
            description={successMessage}
            tone="info"
          />
        ) : null}

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <Button type="submit" size="md" disabled={submitDisabled}>
            {submitLabel}
          </Button>
          {isEditMode ? (
            <Button
              type="button"
              variant="secondary"
              size="md"
              disabled={isSubmitting}
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
              disabled={submitDisabled}
              onClick={() => {
                setForm(initialForm);
                setCharCount(0);
                setErrorMessage(null);
                setSuccessMessage(null);
                setImageSelectionError(null);
                setImageUploadError(null);
                handleImageSelection(null);
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
