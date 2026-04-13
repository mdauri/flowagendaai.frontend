import { useCallback, useRef, useState } from "react";
import { Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/flow/button";
import { tenantCoverImageService } from "@/services/tenant-cover-image-service";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export interface CoverImageUploadProps {
  coverImageUrl?: string | null;
  coverThumbnailUrl?: string | null;
  onUploadComplete: (coverImageUrl: string, coverThumbUrl: string) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export function CoverImageUpload({
  coverImageUrl,
  coverThumbnailUrl,
  onUploadComplete,
  onRemove,
  disabled,
}: CoverImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    async (file: File) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError("Invalid file type. Only JPG, PNG, and WebP are allowed.");
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError("File size exceeds 5MB limit.");
        return;
      }

      setError(null);
      setIsUploading(true);

      try {
        // Step 1: Get presigned URL
        const { uploadUrl, objectKey } = await tenantCoverImageService.getUploadUrl({
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
          throw new Error("Failed to upload image to storage.");
        }

        // Step 3: Confirm upload
        const { coverImageUrl: confirmedUrl, coverImageThumbUrl: thumbUrl } =
          await tenantCoverImageService.confirmUpload({ objectKey });

        onUploadComplete(confirmedUrl, thumbUrl);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to upload cover image.";
        setError(message);
      } finally {
        setIsUploading(false);
        // Reset file input so the same file can be selected again
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [onUploadComplete]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
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

      {coverImageUrl ? (
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-[2.25rem]">
            <img
              src={coverThumbnailUrl || coverImageUrl}
              alt="Current cover image"
              className="h-[120px] w-full object-cover sm:h-[160px]"
              style={{ objectPosition: "center" }}
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleClickUpload}
              disabled={disabled || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={16} aria-hidden="true" />
                  Replace cover
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleRemove}
              disabled={disabled || isUploading}
            >
              <Trash2 size={16} aria-hidden="true" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleClickUpload}
            disabled={disabled || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={16} aria-hidden="true" />
                Upload cover image
              </>
            )}
          </Button>
          <p className="text-xs text-white/55">
            JPG, PNG, or WebP. Max 5MB. Recommended: 1200x400px.
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
