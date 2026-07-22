import { useQuery } from "@tanstack/react-query";
import { customerAppService } from "@/services/customer-app-service";

export function useCustomerAppBookingDetailQuery(
  tenantSlug: string | undefined,
  bookingId: string | undefined,
  sessionToken: string | null,
) {
  return useQuery({
    queryKey: ["customer-app-booking-detail", tenantSlug, bookingId, sessionToken],
    queryFn: async () => {
      if (!tenantSlug || !bookingId || !sessionToken) {
        throw new Error("Contexto do booking do app do cliente ausente.");
      }

      return customerAppService.getBookingDetail(tenantSlug, bookingId, sessionToken);
    },
    enabled: Boolean(tenantSlug && bookingId && sessionToken),
    retry: false,
    staleTime: 30 * 1000,
  });
}
