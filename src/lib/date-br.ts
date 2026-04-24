import { DateTime } from "luxon";

const brDatePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;

export function parseBrDateToIsoDate(value: string): string | null {
  const match = brDatePattern.exec(value.trim());
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  const date = DateTime.fromObject({ year, month, day }, { zone: "utc" });
  if (!date.isValid) return null;

  return date.toFormat("yyyy-MM-dd");
}

export function formatIsoDateTimeToBrDate(value: string, timezone: string): string {
  const date = DateTime.fromISO(value, { zone: "utc" }).setZone(timezone);
  if (!date.isValid) return "-";
  return date.toFormat("dd/MM/yyyy");
}

