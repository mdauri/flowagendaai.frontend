export interface CreateBookingInput {
  professionalId: string;
  serviceId: string;
  start: string;
  idempotencyKey?: string;
}

export interface CreateBookingResponse {
  id: string;
  professionalId: string;
  serviceId: string;
  start: string;
  end: string;
  status: "CONFIRMED";
}

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export interface BookingReadItem {
  id: string;
  status: BookingStatus;
  start: string;
  end: string;
  professionalId: string;
  professionalName: string;
  serviceId: string;
  serviceName: string;
  customerName: string | null;
  customerPhone: string | null;
  createdAt: string;
  cancelledAt: string | null;
}

export interface GetBookingByIdResponse {
  booking: BookingReadItem;
}

export interface ListBookingsResponse {
  items: BookingReadItem[];
  page: number;
  pageSize: number;
  total: number;
}

export interface CancelBookingResponse {
  booking: {
    id: string;
    status: BookingStatus;
    cancelledAt: string;
    cancelledByType: "TENANT_USER" | "PUBLIC" | "SYSTEM";
    cancelReason?: string | null;
  };
}

export interface RescheduleBookingResponse {
  booking: {
    id: string;
    status: "CONFIRMED";
    start: string;
    end: string;
    rescheduledAt: string;
  };
}
