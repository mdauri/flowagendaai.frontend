import { Badge } from "@/components/flow/badge";
import { Button } from "@/components/flow/button";
import { formatUtcTimeRangeWithDateWhenCrossesDay } from "@/lib/date-time";
import type { AvailableSlot } from "@/types/slot";

interface AvailableSlotItemProps {
  slot: AvailableSlot;
  tenantTimezone: string;
  selected: boolean;
  disabled?: boolean;
  onSelect: (slot: AvailableSlot) => void;
}

export function AvailableSlotItem({
  slot,
  tenantTimezone,
  selected,
  disabled = false,
  onSelect,
}: AvailableSlotItemProps) {
  return (
    <Button
      type="button"
      variant="secondary"
      size="md"
      className="h-auto w-full justify-between gap-4 px-5 py-4 text-left"
      aria-pressed={selected}
      disabled={disabled}
      onClick={() => {
        onSelect(slot);
      }}
    >
      <span className="flex flex-col gap-1">
        <span className="text-base font-semibold text-white">
          {formatUtcTimeRangeWithDateWhenCrossesDay(slot.start, slot.end, tenantTimezone)}
        </span>
        <span className="text-sm text-text-soft">{tenantTimezone}</span>
      </span>

      <Badge variant={selected ? "success" : "subtle"}>
        {selected ? "Selecionado" : "Selecionar"}
      </Badge>
    </Button>
  );
}
