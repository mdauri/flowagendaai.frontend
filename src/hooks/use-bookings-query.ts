import { useQuery } from "@tanstack/react-query";
import { bookingsService } from "@/services/bookings-service";

export function useBookingsQuery(params: {
  from: string;
  to: string;
  professionalId?: string;
  status?: string;
  customerName?: string;
  customerPhone?: string;
  page: number;
  pageSize: number;
}) {
  return useQuery({
    queryKey: ["bookings", params],
    queryFn: () => bookingsService.list(params),
  });
}

