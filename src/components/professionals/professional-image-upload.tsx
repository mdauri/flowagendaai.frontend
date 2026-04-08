import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import { Upload, X } from "lucide-react";
import { colors, typography } from "@/design-system";
import { professionalsService } from "@/services/professionals-service";
import { ApiError } from "@/types/api";

interface ProfessionalImageUploadProps {
  professionalId: string;
  currentThumbnailUrl?: string | null;
  currentImageUrl?: string | null;
  pendingRetry?: { file: File; message: string } | null;
  onUploadComplete: (payload: { imageUrl: string; thumbnailUrl: string }) => void;
  onUploadError?: (error: Error, file?: File) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function ProfessionalImageUpload({
  professionalId,
  currentThumbnailUrl,
  currentImageUrl,
  pendingRetry,
  onUploadComplete,
  onUploadError,
}: ProfessionalImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentThumbnailUrl ?? currentImageUrl ?? null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lastFile, setLastFile] = useState<File | null>(null);

  useEffect(() => {
    if (!pendingRetry) return;
    setLastFile(pendingRetry.file);
    setErrorMessage(pendingRetry.message);
  }, [pendingRetry]);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Formato inválido. Use JPG, PNG ou WebP.";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "Arquivo muito grande. Tamanho máximo: 5MB.";
    }
    return null;
  };

  const uploadFile = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      setLastFile(file);

      if (validationError) {
        setErrorMessage(validationError);
        onUploadError?.(new Error(validationError), file);
        return;
      }

      setErrorMessage(null);
      setIsUploading(true);
      setUploadProgress(10);

      try {
        setUploadProgress(20);
        const { uploadUrl, objectKey } =
          await professionalsService.requestImageUploadUrl(professionalId, {
            filename: file.name,
            contentType: file.type,
          });

        setUploadProgress(40);
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

        setUploadProgress(80);
        const confirmed = await professionalsService.confirmImageUpload(
          professionalId,
          objectKey,
        );

        setUploadProgress(100);
        setPreviewUrl(confirmed.thumbnailUrl ?? confirmed.imageUrl);
        onUploadComplete({
          imageUrl: confirmed.imageUrl,
          thumbnailUrl: confirmed.thumbnailUrl,
        });

        setTimeout(() => {
          setUploadProgress(0);
          setIsUploading(false);
        }, 500);
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
            : "Falha ao fazer upload. Tente novamente.";
        setErrorMessage(message);
        onUploadError?.(error instanceof Error ? error : new Error(message), file);
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [professionalId, onUploadComplete, onUploadError],
  );

  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        uploadFile(files[0]);
      }
    },
    [uploadFile],
  );

  const handleFileSelect = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        uploadFile(files[0]);
      }
      e.target.value = "";
    },
    [uploadFile],
  );

  const handleRemoveImage = async () => {
    try {
      await professionalsService.deleteImage(professionalId);
      setPreviewUrl(null);
      setErrorMessage(null);
      onUploadComplete({ imageUrl: "", thumbnailUrl: "" });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Não foi possível remover a imagem.";
      setErrorMessage(message);
      onUploadError?.(error instanceof Error ? error : new Error(message));
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const canRetry = Boolean(lastFile) && Boolean(errorMessage) && !isUploading;

  return (
    <div className="flex flex-col gap-3">
      <div
        className={`relative flex aspect-square w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-all ${
          isDragging
            ? "border-[var(--border-drag)] bg-[var(--bg-drag)]"
            : "border-[var(--border-default)]"
        }`}
        style={
          {
            "--border-default": isDragging
              ? colors.brand.primary
              : colors.text.muted,
            "--bg-drag": "rgba(255, 138, 61, 0.05)",
            "--border-drag": colors.brand.primary,
            backgroundColor: previewUrl ? colors.background.surface2 : undefined,
          } as React.CSSProperties
        }
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label={
          previewUrl
            ? "Clique para trocar a imagem do profissional"
            : "Clique ou arraste para enviar a imagem do profissional"
        }
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt="Preview do profissional"
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition-transform hover:scale-110"
              onClick={(e) => {
                e.stopPropagation();
                void handleRemoveImage();
              }}
              aria-label="Remover imagem"
              disabled={isUploading}
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 p-6 text-center">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full"
              style={{
                backgroundColor: "rgba(255, 138, 61, 0.1)",
              }}
            >
              <Upload
                size={32}
                style={{ color: colors.brand.primary }}
                aria-hidden="true"
              />
            </div>
            <div className="flex flex-col gap-1">
              <p
                className="text-sm font-semibold"
                style={{
                  color: colors.text.primary,
                  fontFamily: typography.family.sans,
                }}
              >
                Enviar foto do profissional
              </p>
              <p
                className="text-xs"
                style={{
                  color: colors.text.soft,
                  fontFamily: typography.family.sans,
                }}
              >
                JPG, PNG ou WebP, até 5MB.
              </p>
            </div>
          </div>
        )}

        {isUploading ? (
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-white">
                Enviando... {uploadProgress}%
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${uploadProgress}%`,
                    backgroundColor: colors.brand.primary,
                  }}
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        className="hidden"
        onChange={handleFileSelect}
      />

      {errorMessage ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-text-soft">
          <p className="font-semibold text-white">Falha no upload</p>
          <p className="mt-1">{errorMessage}</p>
          {canRetry ? (
            <button
              type="button"
              className="mt-3 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/10"
              onClick={() => {
                if (lastFile) {
                  void uploadFile(lastFile);
                }
              }}
            >
              Tentar novamente
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
