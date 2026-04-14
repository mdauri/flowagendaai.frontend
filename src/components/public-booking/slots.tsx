import { DateTime } from "luxon";
import { FeedbackBanner } from "@/components/shared/feedback-banner";
import { MultiDaySlotCard } from "@/components/public-booking/multi-day-slot-card";
import { cn } from "@/lib/cn";
import { colors, radius, semanticTokens } from "@/design-system";
import type { PublicSlot } from "@/types/public-booking";

function isMultiDaySlot(slot: PublicSlot): slot is PublicSlot & { daysAffected: { date: string; start: string; end: string; durationMinutes: number }[] } {
  return "daysAffected" in slot && Array.isArray(slot.daysAffected) && slot.daysAffected.length > 0;
}

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
      className="relative flex h-12 flex-col items-center justify-center border text-center transition-all focus-visible:outline-none focus-visible:[box-shadow:var(--control-focus-ring)] active:scale-[0.98]"
      style={{
        borderRadius: radius.xl,
        "--control-focus-ring": semanticTokens.interaction.focus.ring,
        backgroundColor: selected ? colors.brand.primary : semanticTokens.surface.glass,
        borderColor: selected ? colors.brand.primary : semanticTokens.border.subtle,
        color: selected ? colors.text.dark : colors.text.primary,
        opacity: disabled ? 0.3 : 1,
        backdropFilter: selected ? undefined : `blur(${semanticTokens.blur.panel})`
      } as React.CSSProperties}
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
    >
      <span className="relative z-10 text-[15px] font-semibold tracking-wide">
        {startTime.toFormat("HH:mm")} – {endTime.toFormat("HH:mm")}
      </span>
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
      {slots.map((slot) => {
        if (isMultiDaySlot(slot)) {
          return (
            <MultiDaySlotCard
              key={slot.start}
              slot={slot}
              timezone={timezone}
              selected={selectedSlotStart === slot.start}
              onSelect={() => onSelect(slot)}
            />
          );
        }
        return (
          <SlotCard
            key={slot.start}
            slot={slot}
            timezone={timezone}
            selected={selectedSlotStart === slot.start}
            onSelect={() => onSelect(slot)}
          />
        );
      })}
    </div>
  );
}
