import { DateTime } from "luxon";
import { cn } from "@/lib/cn";

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
    <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-4 py-3">
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
          const disabled = isOutOfRange(day);
          const isToday = day.hasSame(minDate.startOf("day"), "day");
          const hasSlots = availableDates.has(day.toISODate() ?? "");

          return (
            <button
              key={day.toISODate()}
              type="button"
              onClick={() => !disabled && onSelectDate(day)}
              disabled={disabled}
              className={cn(
                "relative flex h-11 w-11 items-center justify-center rounded-2xl border text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
                isSelected
                  ? "border-primary-500 bg-primary-500 text-white"
                  : "border-transparent bg-white/5 text-white",
                !isCurrentMonth && "text-white/40",
                disabled && "cursor-not-allowed opacity-40",
                isToday && !isSelected ? "border-white/40" : ""
              )}
              aria-pressed={isSelected}
            >
              <span>{day.day}</span>
              {hasSlots && !disabled ? (
                <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-primary-500" aria-hidden />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
