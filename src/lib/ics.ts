import { DateTime } from "luxon";

export interface BookingIcsData {
  id: string;
  start: string;
  end: string;
  summary: string;
  description: string;
  location?: string;
}

export function generatePublicBookingICS(data: BookingIcsData) {
  const dtStart = DateTime.fromISO(data.start, { zone: "utc" }).toUTC().toFormat("yyyyMMdd'T'HHmmss'Z'");
  const dtEnd = DateTime.fromISO(data.end, { zone: "utc" }).toUTC().toFormat("yyyyMMdd'T'HHmmss'Z'");
  const dtStamp = DateTime.utc().toFormat("yyyyMMdd'T'HHmmss'Z'");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Agendoro//PublicBooking//PT",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${data.id}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${data.summary}`,
    `DESCRIPTION:${data.description}`,
    `LOCATION:${data.location ?? "Agendoro"}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
}
