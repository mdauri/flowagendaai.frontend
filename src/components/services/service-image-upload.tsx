import {
  useCallback,
  useRef,
  useState,
  type DragEvent,
  type ChangeEvent,
} from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/flow/button";
import { Card, CardDescription } from "@/components/flow/card";
import { colors, typography, radius } from "@/design-system";
import { servicesService } from "@/services/services-service";
import { ApiError } from "@/types/api";

interface ServiceImageUploadProps {
  serviceId: string;
  currentImageUrl?: string | null;
  onUploadComplete: (imageUrl: string) => void;
  onUploadError?: (error: Error) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function ServiceImageUpload({
  serviceId,
  currentImageUrl,
  onUploadComplete,
  onUploadError,
}: ServiceImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentImageUrl ?? null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      if (validationError) {
        setErrorMessage(validationError);
        onUploadError?.(new Error(validationError));
        return;
      }

      setErrorMessage(null);
      setIsUploading(true);
      setUploadProgress(10);

      try {
        // Step 1: Request presigned URL
        setUploadProgress(20);
        const { uploadUrl, imageUrl } = await servicesService.requestUploadUrl(
          serviceId,
          {
            filename: file.name,
            contentType: file.type,
          },
        );

        console.log(uploadUrl);

        // Step 2: Upload directly to S3
        setUploadProgress(40);
        await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        });

        // Step 3: Confirm upload
        setUploadProgress(80);

        console.log("serviceId: ", serviceId, " imageUrl: ", imageUrl);

        await servicesService.confirmUpload(serviceId, imageUrl);

        // Step 4: Update preview
        setUploadProgress(100);
        setPreviewUrl(imageUrl);
        onUploadComplete(imageUrl);

        // Reset progress after delay
        setTimeout(() => {
          setUploadProgress(0);
          setIsUploading(false);
        }, 500);
      } catch (error) {
        console.error("Upload failed:", error);
        const message =
          error instanceof ApiError
            ? error.message
            : "Falha ao fazer upload. Tente novamente.";
        setErrorMessage(message);
        onUploadError?.(error instanceof Error ? error : new Error(message));
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [serviceId, onUploadComplete, onUploadError],
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
      // Reset input value to allow selecting the same file again
      e.target.value = "";
    },
    [uploadFile],
  );

  const handleRemoveImage = async () => {
    try {
      await servicesService.deleteImage(serviceId);
      setPreviewUrl(null);
      onUploadComplete("");
    } catch (error) {
      console.error("Failed to remove image:", error);
      setErrorMessage("Não foi possível remover a imagem.");
      onUploadError?.(
        error instanceof Error ? error : new Error("Falha ao remover imagem"),
      );
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Preview or Upload Area */}
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
            backgroundColor: previewUrl
              ? colors.background.surface2
              : undefined,
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
            ? "Clique para trocar a imagem"
            : "Clique ou arraste para fazer upload"
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
              alt="Preview do serviço"
              className="h-full w-full object-cover"
            />
            {/* Remove button */}
            <button
              type="button"
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition-transform hover:scale-110"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveImage();
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
                style={{
                  color: colors.brand.primary,
                }}
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
                {isDragging
                  ? "Solte a imagem aqui"
                  : "Arraste e solte ou clique para upload"}
              </p>
              <p
                className="text-xs"
                style={{
                  color: colors.text.muted,
                  fontFamily: typography.family.sans,
                }}
              >
                JPG, PNG ou WebP (máx 5MB)
              </p>
            </div>
          </div>
        )}

        {/* Upload Progress Overlay */}
        {isUploading && uploadProgress > 0 && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/80"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex w-3/4 flex-col gap-2">
              {/* Progress Bar */}
              <div
                className="h-2 w-full overflow-hidden rounded-full"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                }}
              >
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${uploadProgress}%`,
                    backgroundColor: colors.brand.primary,
                  }}
                />
              </div>
              <p
                className="text-center text-xs font-medium"
                style={{
                  color: colors.text.primary,
                }}
              >
                {uploadProgress < 40
                  ? "Enviando arquivo..."
                  : uploadProgress < 80
                    ? "Processando imagem..."
                    : "Concluindo..."}
              </p>
            </div>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          onChange={handleFileSelect}
          className="hidden"
          aria-hidden="true"
        />
      </div>

      {/* Error Message */}
      {errorMessage && (
        <CardDescription
          className="text-center"
          style={{
            color: colors.feedback.danger.text,
            fontFamily: typography.family.sans,
          }}
        >
          {errorMessage}
        </CardDescription>
      )}

      {/* Helper Text */}
      {!previewUrl && !errorMessage && (
        <CardDescription
          className="text-center"
          style={{
            color: colors.text.muted,
            fontFamily: typography.family.sans,
          }}
        >
          Adicione uma imagem para atrair mais clientes
        </CardDescription>
      )}
    </div>
  );
}
