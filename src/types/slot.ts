export interface AvailableSlot {
  start: string;
  end: string;
}

export interface ListAvailableSlotsInput {
  professionalId: string;
  serviceId: string;
  date: string;
}

export interface ListAvailableSlotsResponse {
  professionalId: string;
  serviceId: string;
  date: string;
  tenantTimezone: string;
  slots: AvailableSlot[];
}
