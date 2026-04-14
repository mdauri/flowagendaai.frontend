export interface PublicProfessional {
  id: string;
  name: string;
  slug: string;
  tenantId: string;
  tenantTimezone: string;
  tenantName: string;
  tenantSlug: string | null;
  tenantLogoUrl: string | null;
  tenantCoverImageUrl: string | null;
  tenantCoverThumbnailUrl: string | null;
  tenantPublicAddress: string | null;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
}

export interface PublicServiceItem {
  id: string;
  name: string;
  description?: string | null;
  durationInMinutes: number;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  /** True when durationInMinutes > 960 (multi-day service) */
  isMultiDay?: boolean;
}

export interface PublicServicesResponse {
  services: PublicServiceItem[];
}

/** A single day's portion of a multi-day service */
export interface DaySegment {
  /** ISO civil date (e.g., "2026-04-18") */
  date: string;
  /** ISO UTC datetime for segment start */
  start: string;
  /** ISO UTC datetime for segment end */
  end: string;
  /** Duration in minutes for this specific day segment */
  durationMinutes: number;
}

export interface PublicSlot {
  start: string;
  end: string;
  /** Present only for multi-day services */
  daysAffected?: DaySegment[];
  /** Present only for multi-day services */
  totalDurationMinutes?: number;
}

export interface PublicSlotsResponse {
  tenantTimezone: string;
  slots: PublicSlot[];
}

export interface PublicAvailableDatesResponse {
  tenantTimezone: string;
  availableDates: string[];
}

export interface CreatePublicBookingInput {
  slug: string;
  serviceId: string;
  start: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
}

export interface CreatePublicBookingResponse {
  id: string;
  professionalId: string;
  serviceId: string;
  start: string;
  end: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  professionalName: string;
  serviceName: string;
  /** Present only for multi-day bookings */
  daysAffected?: DaySegment[];
}

export type PublicBookingStep = "service" | "date" | "slot" | "customer" | "confirm" | "success";
