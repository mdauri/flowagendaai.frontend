import { Card, CardTitle } from "@/components/flow/card";
import { Select } from "@/components/flow/select";
import type { Professional } from "@/types/professional";

interface AvailabilityProfessionalSelectorProps {
  professionals: Professional[];
  selectedProfessionalId: string;
  tenantTimezone: string;
  onProfessionalChange: (professionalId: string) => void;
}

export function AvailabilityProfessionalSelector({
  professionals,
  selectedProfessionalId,
  tenantTimezone,
  onProfessionalChange,
}: AvailabilityProfessionalSelectorProps) {
  const professionalOptions = professionals.map((professional) => ({
    value: professional.id,
    label: professional.name,
  }));

  return (
    <Card variant="glass" padding="md" className="grid gap-3">
      <div>
        <CardTitle>Selecionar profissional</CardTitle>
      </div>

      <div className="grid gap-2">
        <label htmlFor="availability-professional-select" className="text-sm font-semibold text-[var(--theme-text-primary)]">
          Profissional
        </label>
        <Select
          id="availability-professional-select"
          value={selectedProfessionalId}
          options={professionalOptions}
          placeholder="Selecione um profissional"
          onValueChange={onProfessionalChange}
          aria-describedby="availability-timezone-context"
        />
      </div>

      <div
        id="availability-timezone-context"
        className="rounded-xl border border-[var(--theme-border-subtle)] bg-[var(--theme-surface-glass)] px-3 py-2 text-xs text-text-soft"
      >
        Horario local: <span className="font-semibold text-[var(--theme-text-primary)]">{tenantTimezone}</span>
      </div>
    </Card>
  );
}
