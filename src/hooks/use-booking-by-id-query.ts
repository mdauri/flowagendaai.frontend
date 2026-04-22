import { useQuery } from "@tanstack/react-query";
import { bookingsService } from "@/services/bookings-service";

export function useBookingByIdQuery(id?: string | null) {
  return useQuery({
    queryKey: ["booking", id],
    queryFn: () => bookingsService.getById(id ?? ""),
    enabled: typeof id === "string" && id.length > 0,
  });
}

