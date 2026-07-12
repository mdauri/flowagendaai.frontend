import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tenantService, type UpdateBookingReminderSettingsInput } from "@/services/tenant-service";
import { BOOKING_REMINDER_SETTINGS_QUERY_KEY } from "@/hooks/use-booking-reminder-settings-query";

export function useSaveBookingReminderSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateBookingReminderSettingsInput) =>
      tenantService.updateBookingReminderSettings(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: BOOKING_REMINDER_SETTINGS_QUERY_KEY,
      });
    },
  });
}
