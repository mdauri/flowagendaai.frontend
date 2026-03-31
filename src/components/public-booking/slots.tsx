import { DateTime } from "luxon";
import { FeedbackBanner } from "@/components/shared/feedback-banner";
import { cn } from "@/lib/cn";
import type { PublicSlot } from "@/types/public-booking";

interface SlotCardProps {
  slot: PublicSlot;
  selected: boolean;
  disabled?: boolean;
  timezone: string;
  onSelect: () => void;
}

function SlotCard({ slot, selected, disabled, timezone, onSelect }: SlotCardProps) {
  const startTime = DateTime.fromISO(slot.start, { zone: "utc" }).setZone(timezone);
  const endTime = DateTime.fromISO(slot.end, { zone: "utc" }).setZone(timezone);

  return (
    <button
      type="button"
      className={cn(
        "relative flex h-16 flex-col items-center justify-center rounded-3xl border text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
        selected
          ? "border-primary-500 bg-primary-500/20 text-white"
          : "border-white/10 bg-white/5 text-white",
        disabled && "cursor-not-allowed opacity-40"
      )}
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
    >
      <span className="text-lg font-semibold">
        {startTime.toFormat("HH:mm")} – {endTime.toFormat("HH:mm")}
      </span>
      {selected && <span className="absolute top-3 right-3 text-xl text-primary-500" aria-hidden>✓</span>}
    </button>
  );
}

interface SlotGridProps {
  slots: PublicSlot[];
  selectedSlotStart: string | null;
  timezone: string;
  onSelect: (slot: PublicSlot) => void;
  isLoading: boolean;
}

export function SlotGrid({ slots, selectedSlotStart, timezone, onSelect, isLoading }: SlotGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="h-16 animate-pulse rounded-3xl bg-white/5" />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <FeedbackBanner
        tone="info"
        title="Sem horários disponíveis"
        description="Escolha outra data ou volte mais tarde para novos horários."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {slots.map((slot) => (
        <SlotCard
          key={slot.start}
          slot={slot}
          timezone={timezone}
          selected={selectedSlotStart === slot.start}
          onSelect={() => onSelect(slot)}
        />
      ))}
    </div>
  );
}
