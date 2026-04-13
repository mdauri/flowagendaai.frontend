import { DateTime } from "luxon";
import { cn } from "@/lib/cn";
import { colors, radius, semanticTokens } from "@/design-system";

interface MonthNavigatorProps {
  month: DateTime;
  minDate: DateTime;
  maxDate: DateTime;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export function MonthNavigator({ month, minDate, maxDate, onPrevMonth, onNextMonth }: MonthNavigatorProps) {
  const localeMonth = month.setLocale("pt-BR");
  const prevDisabled = month.startOf("month") <= minDate.startOf("month");
  const nextDisabled = month.startOf("month") >= maxDate.startOf("month");

  return (
    <div 
      className="flex items-center justify-between border px-4 py-2"
      style={{
        borderRadius: radius.xl,
        backgroundColor: semanticTokens.surface.glass,
        borderColor: semanticTokens.border.subtle,
        backdropFilter: `blur(${semanticTokens.blur.panel})`
      }}
    >
      <button
        type="button"
        onClick={onPrevMonth}
        disabled={prevDisabled}
        className="text-2xl leading-none text-white/60 transition hover:text-white"
        aria-label="Mês anterior"
      >
        ◀
      </button>
      <span className="text-base font-semibold text-white">{localeMonth.toFormat("LLLL yyyy")}</span>
      <button
        type="button"
        onClick={onNextMonth}
        disabled={nextDisabled}
        className="text-2xl leading-none text-white/60 transition hover:text-white"
        aria-label="Próximo mês"
      >
        ▶
      </button>
    </div>
  );
}

const WEEKDAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

interface CalendarGridProps {
  month: DateTime;
  selectedDate: DateTime | null;
  minDate: DateTime;
  maxDate: DateTime;
  availableDates: Set<string>;
  onSelectDate: (date: DateTime) => void;
}

export function CalendarGrid({
  month,
  selectedDate,
  minDate,
  maxDate,
  availableDates,
  onSelectDate,
}: CalendarGridProps) {
  const startOfMonth = month.startOf("month");
  const startOffset = startOfMonth.weekday % 7;
  const firstDay = startOfMonth.minus({ days: startOffset });

  const days = Array.from({ length: 42 }).map((_, index) => firstDay.plus({ days: index }));

  const isOutOfRange = (day: DateTime) => day < minDate.startOf("day") || day > maxDate.endOf("day");

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-7 text-center text-xs font-semibold uppercase tracking-wide text-white/60">
        {WEEKDAY_NAMES.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const isCurrentMonth = day.hasSame(month, "month");
          const isSelected = selectedDate ? day.hasSame(selectedDate, "day") : false;
          const hasSlots = availableDates.has(day.toISODate() ?? "");
          const disabled = !isCurrentMonth || isOutOfRange(day) || !hasSlots;
          const isToday = day.hasSame(minDate.startOf("day"), "day");

          return (
            <button
              key={day.toISODate()}
              type="button"
              onClick={() => !disabled && onSelectDate(day)}
              disabled={disabled}
              className={cn(
                "relative flex h-10 w-10 items-center justify-center text-sm transition-all focus-visible:outline-none focus-visible:[box-shadow:var(--control-focus-ring)]",
                disabled ? "cursor-not-allowed opacity-50" : "active:scale-95"
              )}
              style={{
                borderRadius: radius.xl,
                backgroundColor: isSelected ? colors.brand.primary : "transparent",
                color: isSelected ? colors.text.dark : (disabled ? colors.text.muted : colors.text.primary),
                fontWeight: isSelected ? "bold" : "medium",
                "--control-focus-ring": semanticTokens.interaction.focus.ring,
                borderColor: isToday && !isSelected ? semanticTokens.border.subtle : "transparent",
                borderWidth: 1,
              } as React.CSSProperties}
              aria-pressed={isSelected}
            >
              <span className="relative z-10">{day.day}</span>
              {hasSlots && !disabled && !isSelected ? (
                <span className="absolute bottom-1 h-1 w-1 rounded-full" style={{ backgroundColor: colors.brand.primary }} aria-hidden />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
