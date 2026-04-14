import { DateTime } from "luxon";
import { colors, semanticTokens } from "@/design-system";
import { cn } from "@/lib/cn";
import { useState } from "react";

export interface AffectedDay {
  date: string;
  start: string;
  end: string;
  durationMinutes: number;
}

export interface AffectedDaysListProps {
  days: AffectedDay[];
  timezone: string;
  collapsible?: boolean;
  className?: string;
}

export function AffectedDaysList({
  days,
  timezone,
  collapsible = false,
  className,
}: AffectedDaysListProps) {
  const [collapsed, setCollapsed] = useState(collapsible);

  const toggleCollapsed = () => {
    if (collapsible) {
      setCollapsed((prev) => !prev);
    }
  };

  const formatDaySegment = (day: AffectedDay) => {
    const startDate = DateTime.fromISO(day.start, { zone: "utc" }).setZone(timezone);
    const endDate = DateTime.fromISO(day.end, { zone: "utc" }).setZone(timezone);
    const dayDate = DateTime.fromISO(day.date);
    const dayLabel = dayDate.setLocale("pt-BR").toFormat("ccc dd/MM");
    const timeRange = `${startDate.toFormat("HH:mm")} - ${endDate.toFormat("HH:mm")}`;
    const durationHours = Math.round(day.durationMinutes / 60);

    return { dayLabel, timeRange, durationHours };
  };

  const content = (
    <div className="space-y-2">
      {days.map((day, index) => {
        const { dayLabel, timeRange, durationHours } = formatDaySegment(day);
        return (
          <div
            key={day.date}
            className="flex items-center gap-3"
            style={{
              borderBottom: index < days.length - 1 ? `1px solid ${semanticTokens.border.subtle}` : undefined,
              paddingBottom: index < days.length - 1 ? "0.5rem" : 0,
            }}
          >
            <span
              className="inline-block h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: colors.brand.primary }}
              aria-hidden="true"
            />
            <span className="text-sm" style={{ color: colors.text.primary }} aria-label={`Dia ${index + 1}: ${dayLabel}`}>
              <span className="font-medium">{dayLabel}:</span>{" "}
              <span style={{ color: colors.text.soft }}>
                {timeRange} ({durationHours}h)
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );

  if (collapsible) {
    return (
      <div className={cn("space-y-2", className)}>
        <button
          type="button"
          className="flex w-full items-center justify-between text-sm font-medium"
          style={{ color: colors.text.primary }}
          onClick={toggleCollapsed}
          aria-expanded={!collapsed}
        >
          Dias afetados ({days.length})
          <span aria-hidden="true">{collapsed ? "+" : "-"}</span>
        </button>
        {!collapsed && content}
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-sm font-semibold" style={{ color: colors.text.primary }}>
        Dias afetados:
      </p>
      {content}
    </div>
  );
}
