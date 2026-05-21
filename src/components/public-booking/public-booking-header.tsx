import { useEffect, useMemo, useState } from "react";
import type { PublicProfessional } from "@/types/public-booking";
import { Card, CardTitle } from "@/components/flow/card";
import { colors } from "@/design-system";

export function PublicBookingHeader({
  professional,
}: {
  professional: PublicProfessional;
}) {
  const imageSrc = useMemo(
    () => professional.thumbnailUrl ?? professional.imageUrl ?? null,
    [professional.thumbnailUrl, professional.imageUrl],
  );
  const [showImageFallback, setShowImageFallback] = useState(!imageSrc);

  useEffect(() => {
    setShowImageFallback(!imageSrc);
  }, [imageSrc]);

  return (
    <Card
      variant="premium"
      padding="md"
      className="relative w-full overflow-hidden before:absolute before:inset-x-8 before:top-0 before:h-px before:bg-linear-to-r before:from-transparent before:via-primary/45 before:to-transparent"
    >
      <div className="relative z-10 flex items-center gap-4">
        {!showImageFallback && imageSrc ? (
          <img
            src={imageSrc}
            alt={`Foto de ${professional.name}`}
            className="h-14 w-14 rounded-full object-cover shadow-inner ring-1 ring-(--theme-border-subtle) sm:h-16 sm:w-16"
            loading="lazy"
            onError={() => setShowImageFallback(true)}
          />
        ) : (
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full text-2xl font-black shadow-inner ring-1 ring-(--theme-border-subtle) sm:h-16 sm:w-16"
            style={{
              backgroundColor: colors.background.glass,
              color: colors.text.primary,
            }}
            aria-hidden="true"
          >
            {professional.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <CardTitle className="truncate leading-tight">
            {professional.name}
          </CardTitle>
          <p
            className="mt-1 truncate text-sm font-medium"
            style={{ color: colors.text.soft }}
          >
            @{professional.slug}
          </p>
        </div>
      </div>
    </Card>
  );
}
