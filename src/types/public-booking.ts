export interface PublicProfessional {
  id: string;
  name: string;
  slug: string;
  tenantId: string;
  tenantTimezone: string;
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
}

export interface PublicServicesResponse {
  services: PublicServiceItem[];
}

export interface PublicSlot {
  start: string;
  end: string;
}

export interface PublicSlotsResponse {
  tenantTimezone: string;
  slots: PublicSlot[];
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
}

export type PublicBookingStep = "service" | "date" | "slot" | "customer" | "confirm" | "success";
