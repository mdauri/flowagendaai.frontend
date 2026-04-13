import { useCallback, useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/flow/button";
import { tenantLogoImageService } from "@/services/tenant-logo-image-service";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export interface LogoUploadProps {
  logoUrl?: string | null;
  onUploadComplete: (logoUrl: string) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export function LogoUpload({
  logoUrl,
  onUploadComplete,
  onRemove,
  disabled,
}: LogoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    async (file: File) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError(
          "Invalid file type. Only JPG, PNG, and WebP are allowed.",
        );
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError("File size exceeds 2MB limit.");
        return;
      }

      setError(null);
      setIsUploading(true);

      try {
        // Step 1: Get presigned URL
        const { uploadUrl, objectKey } =
          await tenantLogoImageService.getUploadUrl({
            filename: file.name,
            contentType: file.type,
          });

        // Step 2: Upload directly to S3
        const uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload logo to storage.");
        }

        // Step 3: Confirm upload
        const { logoUrl: confirmedUrl } =
          await tenantLogoImageService.confirmUpload({ objectKey });

        onUploadComplete(confirmedUrl);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to upload logo.";
        setError(message);
      } finally {
        setIsUploading(false);
        // Reset file input so the same file can be selected again
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [onUploadComplete],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect],
  );

  const handleRemove = useCallback(() => {
    onRemove();
    setError(null);
  }, [onRemove]);

  const handleClickUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleInputChange}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
      />

      {logoUrl ? (
        <div className="flex items-center gap-3">
          <img
            src={logoUrl}
            alt="Current tenant logo"
            className="h-12 w-12 rounded-full border border-[rgba(255,255,255,0.10)] object-cover sm:h-16 sm:w-16"
          />
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleClickUpload}
              disabled={disabled || isUploading}
              aria-label="Replace logo"
            >
              {isUploading ? (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin"
                    aria-hidden="true"
                  />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={16} aria-hidden="true" />
                  Replace logo
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={disabled || isUploading}
              aria-label="Remove logo"
              className="text-white/55 transition-colors duration-150 hover:text-[#F87171]"
            >
              Remove logo
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.05)] sm:h-16 sm:w-16"
            aria-label="No logo configured"
          >
            <Upload size={20} className="text-white/30" aria-hidden="true" />
          </div>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleClickUpload}
            disabled={disabled || isUploading}
            aria-label="Upload logo"
          >
            {isUploading ? (
              <>
                <Loader2
                  size={16}
                  className="animate-spin"
                  aria-hidden="true"
                />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={16} aria-hidden="true" />
                Upload logo
              </>
            )}
          </Button>
          <p className="text-xs text-white/55">
            JPG, PNG, or WebP. Max 2MB. Recommended: 512x512px.
          </p>
        </div>
      )}

      {error && (
        <p
          role="alert"
          aria-live="assertive"
          className="rounded-lg border border-[rgba(248,113,113,0.28)] bg-[rgba(239,68,68,0.10)] p-3 text-sm leading-relaxed"
          style={{ color: "#F87171" }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
