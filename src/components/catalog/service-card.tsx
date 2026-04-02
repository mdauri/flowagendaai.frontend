import { Clock } from "lucide-react";
import { Button } from "@/components/flow/button";
import { Card, CardTitle } from "@/components/flow/card";
import { colors, typography, radius, semanticTokens, shadows } from "@/design-system";
import { ServiceImageFallback } from "./service-image-fallback";
import type { PublicCatalogService } from "@/types/service";

interface ServiceCardProps {
  service: PublicCatalogService;
  professionalSlug: string;
  onBook: (serviceId: string) => void;
}

export function ServiceCard({ service, professionalSlug, onBook }: ServiceCardProps) {
  const hasImage = Boolean(service.imageUrl);
  
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

  const truncateDescription = (description: string | null | undefined, maxLines: number = 2) => {
    if (!description) return null;
    
    // CSS line-clamp is handled via style
    return description;
  };

  return (
    <Card
      variant="glass"
      padding="none"
      radiusSize="xl"
      className="service-card flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-[var(--border-hover)]"
      style={{
        minHeight: "420px",
        "--border-hover": semanticTokens.border.default,
      } as React.CSSProperties}
    >
      {/* Image Section */}
      <div className="relative aspect-square w-full overflow-hidden" style={{
        minHeight: "200px",
        backgroundColor: hasImage ? colors.background.surface2 : undefined,
      }}>
        {hasImage ? (
          <img
            src={service.imageUrl ?? undefined}
            alt={service.name}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              e.currentTarget.style.display = "none";
              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
              if (fallback) {
                fallback.style.display = "flex";
              }
            }}
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
        <div className="flex items-start justify-between gap-2">
          <CardTitle
            className="text-lg font-bold"
            style={{
              color: colors.text.primary,
              fontFamily: typography.family.sans,
              fontWeight: typography.weight.bold,
              lineHeight: typography.leading.tight,
              letterSpacing: typography.tracking.tight,
            }}
          >
            {service.name}
          </CardTitle>
          <span
            className="text-base font-bold"
            style={{
              color: colors.brand.primary,
              fontFamily: typography.family.sans,
              fontWeight: typography.weight.bold,
              whiteSpace: "nowrap",
            }}
            aria-label={`Preço: ${formatPrice(service.price)}`}
          >
            {formatPrice(service.price)}
          </span>
        </div>

        {/* Duration */}
        <div
          className="flex items-center gap-1.5"
          aria-label={`Duração: ${formatDuration(service.durationInMinutes)}`}
        >
          <Clock
            size={18}
            style={{
              color: colors.text.muted,
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
            className="w-full"
            size="md"
            aria-label={`Agendar ${service.name}`}
            style={{
              fontFamily: typography.family.sans,
              fontWeight: typography.weight.semibold,
            }}
          >
            Agendar
          </Button>
        </div>
      </div>
    </Card>
  );
}
