import { DateTime } from "luxon";
import { MultiDayBadge } from "@/components/slots/multi-day-badge";
import { colors, semanticTokens, radius } from "@/design-system";
import type { PublicSlot } from "@/types/public-booking";

export interface MultiDaySlotCardProps {
  slot: PublicSlot & { daysAffected: { date: string; start: string; end: string; durationMinutes: number }[] };
  selected: boolean;
  disabled?: boolean;
  timezone: string;
  onSelect: () => void;
}

export function MultiDaySlotCard({
  slot,
  selected,
  disabled,
  timezone,
  onSelect,
}: MultiDaySlotCardProps) {
  const startTime = DateTime.fromISO(slot.start, { zone: "utc" }).setZone(timezone);
  const endTime = DateTime.fromISO(slot.end, { zone: "utc" }).setZone(timezone);
  const daysCount = slot.daysAffected.length;

  return (
    <button
      type="button"
      className="relative flex h-20 flex-col items-center justify-center border text-center transition-all focus-visible:outline-none focus-visible:[box-shadow:var(--control-focus-ring)] active:scale-[0.98]"
      style={{
        borderRadius: radius.xl,
        "--control-focus-ring": semanticTokens.interaction.focus.ring,
        backgroundColor: selected ? colors.brand.primary : semanticTokens.surface.glass,
        borderColor: selected
          ? colors.brand.primary
          : disabled
            ? semanticTokens.border.subtle
            : semanticTokens.border.strong,
        color: selected ? colors.text.dark : colors.text.primary,
        opacity: disabled ? 0.3 : 1,
        backdropFilter: selected ? undefined : `blur(${semanticTokens.blur.panel})`,
      } as React.CSSProperties}
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={`Horario ${startTime.toFormat("HH:mm")} as ${endTime.toFormat("HH:mm")}, servico multi-dia ${daysCount} dias`}
    >
      <span className="relative z-10 text-[15px] font-semibold tracking-wide">
        {startTime.toFormat("HH:mm")}
      </span>
      <span className="relative z-10 text-xs font-medium" style={{ color: selected ? colors.text.dark : colors.text.soft }}>
        - {endTime.toFormat("HH:mm")}
      </span>
      <div className="mt-1">
        <MultiDayBadge daysCount={daysCount} variant="compact" className="text-[10px] px-2 py-0.5" />
      </div>
    </button>
  );
}
