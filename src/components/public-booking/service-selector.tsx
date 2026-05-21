import { Button } from "@/components/flow/button";
import { ServiceCard } from "@/components/catalog/service-card";
import { FeedbackBanner } from "@/components/shared/feedback-banner";
import type { PublicServiceItem } from "@/types/public-booking";

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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[1, 2, 3].map((index) => (
          <div key={index} className="h-72 animate-pulse rounded-3xl bg-surface-glass" />
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          selected={selectedServiceId === service.id}
          onBook={() => onSelect(service)}
          actionLabel={selectedServiceId === service.id ? "Selecionado" : "Selecionar"}
        />
      ))}
    </div>
  );
}
