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
