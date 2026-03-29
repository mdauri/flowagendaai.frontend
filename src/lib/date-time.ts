import { DateTime } from "luxon";
import type { AvailabilityDayOfWeek } from "@/types/base-availability";

const dayOfWeekToLuxonWeekday: Record<AvailabilityDayOfWeek, number> = {
  sunday: 7,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

const referenceWeekStartUtc = DateTime.fromObject(
  {
    year: 2026,
    month: 1,
    day: 4,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  },
  { zone: "utc" }
);

export function formatDateTimeInTenantTimezone(value: string, timezone: string): string {
  return DateTime.fromISO(value, { zone: "utc" }).setZone(timezone).toFormat("dd/MM/yyyy, HH:mm");
}

export function formatUtcTimeRangeInTenantTimezone(
  start: string,
  end: string,
  timezone: string
): string {
  const startDateTime = DateTime.fromISO(start, { zone: "utc" }).setZone(timezone);
  const endDateTime = DateTime.fromISO(end, { zone: "utc" }).setZone(timezone);

  return `${startDateTime.toFormat("HH:mm")} - ${endDateTime.toFormat("HH:mm")}`;
}

export function formatUtcTimeInTenantTimezone(
  dayOfWeek: AvailabilityDayOfWeek,
  utcTime: string,
  timezone: string
): string {
  const candidateLocal = resolveUtcTimeInTenantTimezone(dayOfWeek, utcTime, timezone);
  return candidateLocal.toFormat("HH:mm");
}

export function convertUtcTimeToTenantLocalTime(
  dayOfWeek: AvailabilityDayOfWeek,
  utcTime: string,
  timezone: string
): string {
  return formatUtcTimeInTenantTimezone(dayOfWeek, utcTime, timezone);
}

function resolveUtcTimeInTenantTimezone(
  dayOfWeek: AvailabilityDayOfWeek,
  utcTime: string,
  timezone: string
): DateTime {
  const [hours, minutes, seconds = 0] = utcTime.replace("Z", "").split(":").map(Number);
  const expectedWeekday = dayOfWeekToLuxonWeekday[dayOfWeek];

  for (let dayOffset = -1; dayOffset <= 7; dayOffset += 1) {
    const candidateUtc = referenceWeekStartUtc.plus({
      days: dayOffset,
      hours,
      minutes,
      seconds,
    });
    const candidateLocal = candidateUtc.setZone(timezone);

    if (candidateLocal.isValid && candidateLocal.weekday === expectedWeekday) {
      return candidateLocal;
    }
  }

  return DateTime.fromFormat(utcTime, "HH:mm:ss'Z'", { zone: "utc" }).setZone(timezone);
}
