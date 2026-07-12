import { useQuery } from "@tanstack/react-query";
import { tenantService } from "@/services/tenant-service";

export const BOOKING_REMINDER_SETTINGS_QUERY_KEY = [
  "tenant",
  "booking-reminder-settings",
] as const;

export function useBookingReminderSettingsQuery(tenantId: string | null) {
  return useQuery({
    queryKey: [...BOOKING_REMINDER_SETTINGS_QUERY_KEY, tenantId],
    queryFn: () => tenantService.getBookingReminderSettings(),
    retry: false,
    enabled: Boolean(tenantId),
  });
}
