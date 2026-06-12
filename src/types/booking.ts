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
  status: "CONFIRMED" | "AWAITING_DEPOSIT";
  depositRequired: boolean;
  depositStatus: "NOT_REQUIRED" | "PENDING";
  depositAmountCents: number | null;
  depositPaymentProvider: "MANUAL" | "MERCADO_PAGO";
}

export type BookingStatus = "PENDING" | "AWAITING_DEPOSIT" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
export type BookingDepositStatus = "NOT_REQUIRED" | "PENDING" | "PAID" | "WAIVED" | "EXPIRED";

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
  customerEmail: string | null;
  depositRequired: boolean;
  depositStatus: BookingDepositStatus;
  depositAmountCents: number | null;
  depositPaymentProvider: "MANUAL" | "MERCADO_PAGO";
  depositPaymentUrl: string | null;
  depositExternalId: string | null;
  depositPaidAt: string | null;
  depositMarkedPaidByUserId: string | null;
  depositNotes: string | null;
  servicePriceSnapshot?: number | null;
  servicePrice?: number | null;
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

export interface CreatePendingBookingInput {
  professionalId: string;
  serviceId: string;
  start: string;
  customerName?: string;
  customerPhone?: string;
}

export interface CreatePendingBookingResponse {
  booking: {
    id: string;
    status: "PENDING";
    start: string;
    end: string;
    pendingExpiresAt: string;
  };
}

export interface ConfirmPendingBookingResponse {
  booking: {
    id: string;
    status: "CONFIRMED";
  };
}

export interface MarkBookingDepositPaidResponse {
  booking: {
    id: string;
    status: "CONFIRMED";
    depositStatus: "PAID";
    depositPaidAt: string;
    depositMarkedPaidByUserId: string;
    confirmedAt: string;
    confirmedById: string;
  };
}
