import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/flow/button";
import { Card } from "@/components/flow/card";
import { FeedbackBanner } from "@/components/shared/feedback-banner";
import type { PublicServiceItem } from "@/types/public-booking";
import { colors, semanticTokens } from "@/design-system";

interface ServiceCardProps {
  service: PublicServiceItem;
  selected: boolean;
  onSelect: (service: PublicServiceItem) => void;
}

function ServiceCard({ service, selected, onSelect }: ServiceCardProps) {
  const imageSrc = useMemo(
    () => service.thumbnailUrl ?? service.imageUrl ?? null,
    [service.thumbnailUrl, service.imageUrl],
  );
  const [showImageFallback, setShowImageFallback] = useState(!imageSrc);

  useEffect(() => {
    setShowImageFallback(!imageSrc);
  }, [imageSrc]);

  const serviceInitials = useMemo(() => {
    return service.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }, [service.name]);

  return (
    <button
      type="button"
      className="flex w-full flex-col text-left outline-none transition-all focus-visible:outline-none focus-visible:[box-shadow:var(--control-focus-ring)]"
      style={{
        "--control-focus-ring": semanticTokens.interaction.focus.ring
      } as React.CSSProperties}
      onClick={() => onSelect(service)}
      aria-pressed={selected}
    >
      <Card
        variant="glass"
        className="w-full transition-all"
        style={{
          borderColor: selected ? colors.brand.primary : semanticTokens.border.subtle,
          boxShadow: selected ? `0 0 0 1px ${colors.brand.primary}` : undefined,
          backgroundColor: selected ? semanticTokens.surface.glassHover : semanticTokens.surface.glass
        }}
      >
        <div className="mb-3">
          {!showImageFallback && imageSrc ? (
            <img
              src={imageSrc}
              alt={`Imagem do serviço ${service.name}`}
              className="h-28 w-full rounded-2xl object-cover"
              loading="lazy"
              onError={() => setShowImageFallback(true)}
            />
          ) : (
            <div
              className="flex h-28 w-full items-center justify-center rounded-2xl text-lg font-black"
              style={{ backgroundColor: colors.background.glassSubtle, color: colors.text.primary }}
              aria-hidden="true"
            >
              {serviceInitials}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-base font-semibold" style={{ color: colors.text.primary }}>
            {service.name}
          </span>
          {selected && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full text-xs" style={{ backgroundColor: colors.brand.primary, color: colors.text.dark }} aria-hidden>
              ✓
            </span>
          )}
        </div>
        <p className="mt-1.5 text-sm font-medium" style={{ color: colors.text.soft }}>
          {service.durationInMinutes} minutos
        </p>
        {service.description && (
          <p
            className="mt-2 text-sm"
            style={{ color: colors.text.soft, whiteSpace: "pre-wrap" }}
          >
            {service.description.length > 150
              ? `${service.description.substring(0, 150)}...`
              : service.description}
          </p>
        )}
      </Card>
    </button>
  );
}

export interface ServiceSelectorProps {
  services: PublicServiceItem[];
  selectedServiceId: string | null;
  onSelect: (service: PublicServiceItem) => void;
  isLoading: boolean;
  error?: unknown;
  onRetry?: () => void;
}

export function ServiceSelector({
  services,
  selectedServiceId,
  onSelect,
  isLoading,
  error,
  onRetry,
}: ServiceSelectorProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((index) => (
          <div key={index} className="h-20 animate-pulse rounded-3xl bg-white/5" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <FeedbackBanner
          tone="warning"
          title="Não foi possível carregar os serviços"
          description="Tente novamente mais tarde."
        />
        <Button variant="secondary" size="md" onClick={onRetry}>
          Recarregar
        </Button>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <FeedbackBanner
        tone="info"
        title="Nenhum serviço disponível"
        description="O profissional não possui serviços públicos neste momento."
      />
    );
  }

  return (
    <div className="space-y-3">
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          selected={selectedServiceId === service.id}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
