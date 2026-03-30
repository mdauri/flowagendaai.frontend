import { Card, CardDescription, CardTitle } from "@/components/flow/card";
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
    <Card variant="glass" padding="lg" className="grid gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <CardTitle>Horários disponíveis (não garantem reserva)</CardTitle>
          <CardDescription className="mt-3">
            Os horarios abaixo foram retornados pela API e seguem exatamente a ordem recebida.
          </CardDescription>
        </div>

        <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-text-soft">
          {slots.length} {slots.length === 1 ? "slot encontrado" : "slots encontrados"}
        </div>
      </div>

      <p className="text-sm leading-6 text-text-soft">
        Timezone do tenant: <span className="font-semibold text-white">{tenantTimezone}</span>
      </p>

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
