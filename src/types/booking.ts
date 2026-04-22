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

export interface CancelBookingResponse {
  booking: {
    id: string;
    status: BookingStatus;
    cancelledAt: string;
    cancelledByType: "TENANT_USER" | "PUBLIC" | "SYSTEM";
    cancelReason?: string | null;
  };
}
