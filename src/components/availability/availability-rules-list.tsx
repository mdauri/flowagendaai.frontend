import { Button } from "@/components/flow/button";
import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import { formatUtcTimeInTenantTimezone } from "@/lib/date-time";
import type { AvailabilityBaseItem } from "@/types/base-availability";

interface AvailabilityRulesListProps {
  availability: AvailabilityBaseItem[];
  professionalName: string;
  tenantTimezone: string;
  isDeleting: boolean;
  onEdit: (item: AvailabilityBaseItem) => void;
  onDelete: (item: AvailabilityBaseItem) => void;
}

const dayLabels = {
  sunday: "Domingo",
  monday: "Segunda-feira",
  tuesday: "Terca-feira",
  wednesday: "Quarta-feira",
  thursday: "Quinta-feira",
  friday: "Sexta-feira",
  saturday: "Sabado",
} as const;

export function AvailabilityRulesList({
  availability,
  professionalName: _professionalName,
  tenantTimezone,
  isDeleting,
  onEdit,
  onDelete,
}: AvailabilityRulesListProps) {
  return (
    <div className="grid gap-4">
      <Card variant="glass" padding="md">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <CardTitle>Horarios ({availability.length})</CardTitle>
          </div>
        </div>
      </Card>

      {availability.map((item) => (
        <Card key={item.id} variant="surface" padding="md" className="border-white/10">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle>{dayLabels[item.dayOfWeek]}</CardTitle>
              <CardDescription className="mt-2">
                <span className="font-semibold text-white">
                  {formatUtcTimeInTenantTimezone(item.dayOfWeek, item.startTimeUtc, tenantTimezone)} -{" "}
                  {formatUtcTimeInTenantTimezone(item.dayOfWeek, item.endTimeUtc, tenantTimezone)}
                </span>
              </CardDescription>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" size="sm" className="h-8 px-3 text-xs" onClick={() => onEdit(item)}>
                Editar
              </Button>
              <Button variant="secondary" size="sm" className="h-8 px-3 text-xs" disabled={isDeleting} onClick={() => onDelete(item)}>
                {isDeleting ? "Removendo..." : "Remover"}
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
