import { useRef } from "react";
import type { ProfessionalListProps } from "@/types/professional-service";
import { ProfessionalItem } from "./professional-item";
import { Users } from "lucide-react";
import { Button } from "./flow/button";
import { Card } from "./flow/card";

export function ProfessionalList({
  professionals,
  selectedIds,
  onSelectionChange,
  serviceId,
}: ProfessionalListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const isVirtualized = professionals.length >= 50;

  // Simple rendering for now (virtual scrolling can be added later if needed)
  if (professionals.length === 0) {
    return (
      <Card variant="surface" padding="lg" className="text-center py-12">
        <div className="flex flex-col items-center gap-4">
          <Users className="h-12 w-12 text-white/30" />
          <div>
            <h3 className="text-lg font-semibold text-white">
              No professionals found
            </h3>
            <p className="text-sm text-white/55 mt-1">
              Your tenant does not have any professionals yet.
            </p>
          </div>
          <Button variant="primary" size="md" as="a" href="/app/professionals">
            Add Professional
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div ref={parentRef} className="space-y-3" role="list" aria-label="Professionals list">
      {professionals.map((professional) => (
        <ProfessionalItem
          key={professional.id}
          professional={professional}
          isSelected={selectedIds.has(professional.id)}
          onToggle={(selected) => onSelectionChange(professional.id, selected)}
          serviceId={serviceId}
        />
      ))}
    </div>
  );
}
