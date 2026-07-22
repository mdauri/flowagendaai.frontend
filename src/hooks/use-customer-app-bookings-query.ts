import { useQuery } from "@tanstack/react-query";
import { customerAppService } from "@/services/customer-app-service";

export function useCustomerAppBookingsQuery(
  tenantSlug: string | undefined,
  sessionToken: string | null,
) {
  return useQuery({
    queryKey: ["customer-app-bookings", tenantSlug, sessionToken],
    queryFn: async () => {
      if (!tenantSlug || !sessionToken) {
        throw new Error("Sessao do app do cliente ausente.");
      }

      return customerAppService.listBookings(tenantSlug, sessionToken);
    },
    enabled: Boolean(tenantSlug && sessionToken),
    retry: false,
    staleTime: 30 * 1000,
  });
}
