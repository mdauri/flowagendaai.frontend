export function formatDateTimeInTenantTimezone(
  value: string,
  timezone: string
): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: timezone,
  }).format(new Date(value));
}
