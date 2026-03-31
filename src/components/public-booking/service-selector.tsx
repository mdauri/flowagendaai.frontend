import { Button } from "@/components/flow/button";
import { FeedbackBanner } from "@/components/shared/feedback-banner";
import type { PublicServiceItem } from "@/types/public-booking";
import { cn } from "@/lib/cn";

interface ServiceCardProps {
  service: PublicServiceItem;
  selected: boolean;
  onSelect: (service: PublicServiceItem) => void;
}

function ServiceCard({ service, selected, onSelect }: ServiceCardProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full flex-col rounded-3xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
        selected
          ? "border-primary-500 bg-primary-500/10"
          : "border-white/10 bg-white/5 hover:border-white/30"
      )}
      onClick={() => onSelect(service)}
      aria-pressed={selected}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-white">{service.name}</span>
        {selected && <span className="text-2xl text-primary-500" aria-hidden>✓</span>}
      </div>
      <p className="mt-2 text-sm text-white/70">{service.durationInMinutes} minutos</p>
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
