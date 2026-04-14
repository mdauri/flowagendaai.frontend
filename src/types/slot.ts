import type { DaySegment } from "@/types/public-booking";

export interface AvailableSlot {
  start: string;
  end: string;
  /** Present only for multi-day services */
  daysAffected?: DaySegment[];
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

export interface ListAvailableDatesInput {
  professionalId: string;
  serviceId: string;
  from: string;
  to: string;
}

export interface ListAvailableDatesResponse {
  professionalId: string;
  serviceId: string;
  tenantTimezone: string;
  from: string;
  to: string;
  availableDates: string[];
}
