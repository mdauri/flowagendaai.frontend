import { useCallback, useState } from "react";
import { MapPin } from "lucide-react";
import { colors, typography, radius } from "@/design-system";
import { cn } from "@/lib/cn";

export interface TenantCoverBannerProps {
  tenantName: string;
  tenantSlug?: string;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  coverThumbnailUrl?: string | null;
  publicAddress?: string | null;
  variant: "full" | "compact";
  isLoading?: boolean;
  className?: string;
}

const heightClasses = {
  full: "h-[160px] sm:h-[220px] lg:h-[280px]",
  compact: "h-[80px] sm:h-[100px] lg:h-[120px]",
};

const logoSizeClasses = {
  full: "h-12 w-12 sm:h-16 sm:w-16",
  compact: "h-8 w-8 sm:h-12 sm:w-12",
};

const nameSizeClasses = {
  full: "text-xl sm:text-[1.75rem]",
  compact: "text-base sm:text-lg",
};

const addressSizeClasses = {
  full: "text-sm",
  compact: "text-xs",
};

const overlayPaddingClasses = {
  full: "p-4 sm:p-6",
  compact: "p-3 sm:p-4",
};

const containerMaxWidthClasses = {
  full: "max-w-[1200px]",
  compact: "max-w-2xl",
};

const FALLBACK_GRADIENT =
  "linear-gradient(135deg, #19130F 0%, #141416 50%, #0F0F11 100%)";

function SkeletonBanner({ variant }: { variant: "full" | "compact" }) {
  return (
    <div
      className={cn(
<<<<<<< HEAD
        "relative overflow-hidden rounded-xxl",
=======
        "relative overflow-hidden rounded-[2.25rem]",
>>>>>>> refs/remotes/origin/master
        heightClasses[variant],
      )}
      role="status"
      aria-label="Loading banner"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s ease-in-out infinite",
        }}
      />
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .skeleton-shimmer {
            animation: none;
            background: rgba(255, 255, 255, 0.08);
          }
        }
      `}</style>
    </div>
  );
}

function LogoAvatar({
  logoUrl,
  tenantName,
  sizeClass,
}: {
  logoUrl?: string | null;
  tenantName: string;
  sizeClass: string;
}) {
  const [imgError, setImgError] = useState(false);

  if (logoUrl && !imgError) {
    return (
      <img
        src={logoUrl}
        alt=""
        className={cn(
          sizeClass,
          "shrink-0 rounded-full border border-white/10 object-cover",
        )}
        onError={() => setImgError(true)}
      />
    );
  }

  const initial = tenantName.charAt(0).toUpperCase();

  return (
    <div
      className={cn(
        sizeClass,
        "flex shrink-0 items-center justify-center rounded-full border border-white/10 text-white font-black",
      )}
      style={{
        backgroundColor: colors.brand.primary,
        fontSize:
          sizeClass === "h-8 w-8 sm:h-12 sm:w-12" ? "0.875rem" : "1.25rem",
      }}
      aria-hidden="true"
    >
      {initial}
    </div>
  );
}

export function TenantCoverBanner({
  tenantName,
  tenantSlug,
  logoUrl,
  coverImageUrl,
  coverThumbnailUrl,
  publicAddress,
  variant,
  isLoading,
  className,
}: TenantCoverBannerProps) {
  const [imgError, setImgError] = useState(false);

  const handleImageError = useCallback(() => {
    console.warn(
      `[TenantCoverBanner] Cover image failed to load for tenant "${tenantName}". Using fallback gradient.`,
    );
    setImgError(true);
  }, [tenantName]);

  if (isLoading) {
    return <SkeletonBanner variant={variant} />;
  }

  const hasCoverImage = Boolean(coverImageUrl) && !imgError;
  const imageUrl = hasCoverImage
    ? variant === "compact" && coverThumbnailUrl
      ? coverThumbnailUrl
      : coverImageUrl
    : null;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xxl",
        heightClasses[variant],
        containerMaxWidthClasses[variant],
        className,
      )}
      role={!hasCoverImage ? "img" : undefined}
      aria-label={
        !hasCoverImage
          ? `Banner for ${tenantName}${publicAddress ? `, located at ${publicAddress}` : ""}`
          : undefined
      }
    >
      {/* Cover image or fallback gradient */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={`Cover image for ${tenantName}`}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: "center" }}
          loading={variant === "full" ? "eager" : "lazy"}
          onError={handleImageError}
        />
      ) : (
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{ backgroundImage: FALLBACK_GRADIENT }}
        />
      )}

      {/* Gradient overlay for text legibility */}
      <div
        className="absolute inset-0 z-1"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(to top, rgba(10,10,11,0.92) 0%, rgba(10,10,11,0.65) 40%, transparent 100%)",
        }}
      />

      {/* Text content */}
      <div
        className={cn(
          "relative z-10 flex items-end gap-3",
          overlayPaddingClasses[variant],
        )}
      >
        <LogoAvatar
          logoUrl={logoUrl}
          tenantName={tenantName}
          sizeClass={logoSizeClasses[variant]}
        />

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h1
            className={cn(
              "font-black leading-[1.2] tracking-tight text-white",
              nameSizeClasses[variant],
            )}
            style={{
              textShadow: "0 1px 3px rgba(0, 0, 0, 0.5)",
              fontFamily: typography.family.sans,
              letterSpacing: typography.tracking.tight,
              lineHeight: typography.leading.tight,
              fontWeight: typography.weight.black,
            }}
          >
            {tenantName}
          </h1>

          {variant === "full" && tenantSlug && (
            <p
              className="text-sm font-medium"
              style={{
                color: "rgba(255, 255, 255, 1)",
                textShadow: "0 1px 3px rgba(0, 0, 0, 0.5)",
                fontFamily: typography.family.sans,
                lineHeight: typography.leading.relaxed,
                fontWeight: typography.weight.black,
              }}
            >
              @{tenantSlug}
            </p>
          )}

          {publicAddress && (
            <p
              className={cn(
                "flex items-center gap-1.5 font-medium",
                addressSizeClasses[variant],
                variant === "compact" && "max-sm:max-w-50 max-sm:truncate",
              )}
              title={publicAddress}
              style={{
                color: "rgba(255, 255, 255, 1)",
                textShadow: "0 1px 3px rgba(0, 0, 0, 0.5)",
                fontFamily: typography.family.sans,
                lineHeight: typography.leading.relaxed,
                fontWeight: typography.weight.black,
              }}
            >
              <MapPin size={variant === "full" ? 14 : 12} aria-hidden="true" />
              {publicAddress}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
