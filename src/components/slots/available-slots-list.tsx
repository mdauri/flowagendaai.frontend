import { Card, CardTitle } from "@/components/flow/card";
import { AvailableSlotItem } from "@/components/slots/available-slot-item";
import type { AvailableSlot } from "@/types/slot";

interface AvailableSlotsListProps {
  slots: AvailableSlot[];
  tenantTimezone: string;
  selectedSlotStart: string | null;
  disabled?: boolean;
  onSelect: (slot: AvailableSlot) => void;
}

export function AvailableSlotsList({
  slots,
  tenantTimezone,
  selectedSlotStart,
  disabled = false,
  onSelect,
}: AvailableSlotsListProps) {
  return (
    <Card variant="glass" padding="md" className="grid gap-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <CardTitle>Horarios disponiveis ({slots.length})</CardTitle>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {slots.map((slot) => (
          <AvailableSlotItem
            key={slot.start}
            slot={slot}
            tenantTimezone={tenantTimezone}
            selected={selectedSlotStart === slot.start}
            disabled={disabled}
            onSelect={onSelect}
          />
        ))}
      </div>
    </Card>
  );
}
