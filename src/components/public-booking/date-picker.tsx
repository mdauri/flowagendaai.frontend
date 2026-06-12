import { ChevronLeft, ChevronRight } from "lucide-react";
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
      className="grid grid-cols-[auto,minmax(0,1fr),auto] items-center gap-2 border px-3 py-2 sm:px-4"
      style={{
        borderRadius: radius.xl,
        backgroundColor: semanticTokens.surface.glass,
        borderColor: semanticTokens.border.subtle,
        backdropFilter: `blur(${semanticTokens.blur.panel})`,
      }}
    >
      <button
        type="button"
        onClick={onPrevMonth}
        disabled={prevDisabled}
        className="flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition hover:bg-[var(--theme-overlay-primary-soft)] hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
        aria-label="Mês anterior"
      >
        <ChevronLeft size={20} aria-hidden="true" />
      </button>
      <span className="min-w-0 truncate text-sm font-semibold text-text-primary sm:text-base">
        {localeMonth.toFormat("LLLL yyyy")}
      </span>
      <button
        type="button"
        onClick={onNextMonth}
        disabled={nextDisabled}
        className="flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition hover:bg-[var(--theme-overlay-primary-soft)] hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
        aria-label="Próximo mês"
      >
        <ChevronRight size={20} aria-hidden="true" />
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
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wide text-text-muted sm:text-xs">
        {WEEKDAY_NAMES.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {days.map((day) => {
          const isCurrentMonth = day.hasSame(month, "month");
          const isSelected = selectedDate ? day.hasSame(selectedDate, "day") : false;
          const hasSlots = availableDates.has(day.toISODate() ?? "");
          const isPast = day < minDate.startOf("day");
          const unavailable = !hasSlots;
          const disabled = !isCurrentMonth || isOutOfRange(day) || unavailable;
          const isToday = day.hasSame(minDate.startOf("day"), "day");

          return (
            <button
              key={day.toISODate()}
              type="button"
              onClick={() => !disabled && onSelectDate(day)}
              disabled={disabled}
            className={cn(
                "relative flex h-9 w-9 items-center justify-center rounded-full text-sm transition-all focus-visible:outline-none focus-visible:[box-shadow:var(--control-focus-ring)] sm:h-10 sm:w-10",
                disabled
                  ? "cursor-not-allowed"
                  : "cursor-pointer hover:bg-[var(--theme-overlay-primary-soft)] active:scale-95",
              )}
              style={{
                backgroundColor: isSelected ? colors.brand.primary : "transparent",
                color: isSelected ? colors.text.dark : (disabled ? colors.text.muted : colors.text.primary),
                fontWeight: isSelected || isToday ? 700 : 500,
                opacity: disabled ? (isPast ? 0.3 : 0.4) : 1,
                "--control-focus-ring": semanticTokens.interaction.focus.ring,
                borderColor: isToday && !isSelected ? semanticTokens.border.subtle : "transparent",
                borderWidth: 1,
              } as React.CSSProperties}
              aria-pressed={isSelected}
            >
              <span className="relative z-10">{day.day}</span>
              {isToday && !isSelected ? (
                <span className="absolute bottom-1 h-1 w-1 rounded-full" style={{ backgroundColor: colors.brand.primary }} aria-hidden />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
