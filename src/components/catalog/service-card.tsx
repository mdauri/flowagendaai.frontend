import { Clock } from "lucide-react";
import { Button } from "@/components/flow/button";
import { Card, CardTitle } from "@/components/flow/card";
import { colors, typography, semanticTokens } from "@/design-system";
import { ServiceImageFallback } from "./service-image-fallback";
import type { PublicCatalogService } from "@/types/service";

type ServiceCardModel = Omit<PublicCatalogService, "price"> & {
  price?: number;
};

interface ServiceCardProps {
  service: ServiceCardModel;
  tenantSlug?: string;
  onBook: (serviceId: string) => void;
  actionLabel?: string;
  selected?: boolean;
}

export function ServiceCard({
  service,
  onBook,
  actionLabel = "Agendar",
  selected = false,
}: ServiceCardProps) {
  const imageSrc = service.thumbnailUrl ?? service.imageUrl ?? undefined;
  const hasImage = Boolean(imageSrc);

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes >= 60 && minutes % 60 === 0) {
      const hours = minutes / 60;
      return `${hours}h`;
    }
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}min`;
    }
    return `${minutes} min`;
  };

  const truncateDescription = (
    description: string | null | undefined,
    maxLines: number = 2,
  ) => {
    if (!description) return null;

    // CSS line-clamp is handled via style
    return description;
  };

  return (
    <Card
      variant="glass"
      padding="none"
      radiusSize="xl"
      className="service-card flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-(--border-hover) hover:shadow-card"
      style={
        {
          minHeight: "400px",
          "--border-hover": semanticTokens.border.default,
          borderColor: selected ? colors.brand.primary : undefined,
          boxShadow: selected ? `0 0 0 1px ${colors.brand.primary}` : undefined,
        } as React.CSSProperties
      }
    >
      {/* Image Section */}
      <div
        className="relative aspect-square w-full overflow-hidden"
        style={{
          minHeight: "200px",
          backgroundColor: hasImage ? colors.background.surface2 : undefined,
        }}
      >
        {hasImage ? (
          <img
            src={imageSrc}
            alt={`Imagem do serviço ${service.name}`}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              e.currentTarget.style.display = "none";
              const fallback = e.currentTarget
                .nextElementSibling as HTMLElement;
              if (fallback) {
                fallback.style.display = "flex";
              }
            }}
          />
        ) : null}
        {hasImage ? (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-[rgba(0,0,0,0.28)] to-transparent"
            aria-hidden="true"
          />
        ) : null}

        {/* Fallback (shown when no image or image fails) */}
        <div
          className={`absolute inset-0 ${hasImage ? "hidden" : "flex"}`}
          style={{ display: hasImage ? "none" : "flex" }}
        >
          <ServiceImageFallback
            serviceId={service.id}
            serviceName={service.name}
            className="w-full"
          />
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        {/* Name and Price */}
        <div className="flex items-start justify-between gap-3">
          <CardTitle
            className="min-w-0 text-lg font-semibold"
            style={{
              color: colors.text.primary,
              fontFamily: typography.family.sans,
              fontWeight: typography.weight.semibold,
              lineHeight: typography.leading.tight,
              letterSpacing: 0,
            }}
          >
            {service.name}
          </CardTitle>
          {typeof service.price === "number" ? (
            <span
              className="shrink-0 rounded-full border px-3 py-1 text-sm font-bold"
              style={{
                backgroundColor: colors.badge.background,
                borderColor: colors.badge.border,
                color: colors.badge.text,
                fontFamily: typography.family.sans,
                fontWeight: typography.weight.bold,
                whiteSpace: "nowrap",
              }}
              aria-label={`Preço: ${formatPrice(service.price)}`}
            >
              {formatPrice(service.price)}
            </span>
          ) : null}
        </div>

        {/* Duration */}
        <div
          className="flex items-center gap-2"
          aria-label={`Duração: ${formatDuration(service.durationInMinutes)}`}
        >
          <Clock
            size={20}
            strokeWidth={2.4}
            style={{
              color: colors.brand.primary,
            }}
            aria-hidden="true"
          />
          <span
            className="text-xs font-semibold"
            style={{
              color: colors.text.soft,
              fontFamily: typography.family.sans,
              fontWeight: typography.weight.semibold,
            }}
          >
            {formatDuration(service.durationInMinutes)}
          </span>
        </div>

        {/* Description */}
        {service.description && (
          <p
            className="line-clamp-2 text-sm leading-relaxed"
            style={{
              color: colors.text.soft,
              fontFamily: typography.family.sans,
              whiteSpace: "pre-wrap",
              display: "-webkit-box",
              WebkitLineClamp: "2",
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {truncateDescription(service.description)}
          </p>
        )}

        {/* Book Button */}
        <div className="mt-auto pt-2">
          <Button
            onClick={() => onBook(service.id)}
            className="w-full hover:scale-[1.02] hover:shadow-depth"
            size="md"
            aria-label={`${actionLabel} ${service.name}`}
            style={{
              fontFamily: typography.family.sans,
              fontWeight: typography.weight.semibold,
            }}
          >
            {actionLabel}
          </Button>
        </div>
      </div>
    </Card>
  );
}
