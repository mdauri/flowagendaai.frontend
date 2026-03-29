import { Card, CardDescription, CardTitle } from "@/components/flow/card";
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
    <Card variant="glass" padding="lg" className="grid gap-5">
      <div>
        <CardTitle>Contexto operacional</CardTitle>
        <CardDescription className="mt-3">
          Selecione primeiro o profissional. A tela apenas representa o estado da disponibilidade base
          e exibe o timezone do tenant como contexto.
        </CardDescription>
      </div>

      <div className="grid gap-2">
        <label htmlFor="availability-professional-select" className="text-sm font-semibold text-white">
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
        className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-sm leading-6 text-text-soft"
      >
        Timezone do tenant: <span className="font-semibold text-white">{tenantTimezone}</span>
      </div>
    </Card>
  );
}
