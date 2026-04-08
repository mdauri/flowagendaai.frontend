export interface Professional {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListProfessionalsResponse {
  professionals: Professional[];
}

export interface CreateProfessionalInput {
  name: string;
  description?: string | null;
}

export interface CreateProfessionalResponse {
  professional: Professional;
}

export interface UpdateProfessionalInput {
  name: string;
  description?: string | null;
}

export interface UpdateProfessionalResponse {
  professional: Professional;
}

export interface DeleteProfessionalResponse {
  removed: true;
}

export interface ProfessionalImageUploadUrlResponse {
  uploadUrl: string;
  objectKey: string;
  imageUrl: string;
}

export interface ProfessionalImageConfirmResponse {
  imageUrl: string;
  thumbnailUrl: string;
}

export interface EligibleProfessional {
  id: string;
  name: string;
}

export interface ImpactedBooking {
  id: string;
  start: string;
  end: string;
  status: string;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  service: {
    id: string;
    name: string;
    durationInMinutes: number;
  };
  eligibleProfessionals: EligibleProfessional[];
}

export interface ImpactedProfessionalBookingsResponse {
  professional: {
    id: string;
    name: string;
  };
  bookings: ImpactedBooking[];
}

export interface ReassignImpactedBookingInput {
  targetProfessionalId: string;
}

export interface ReassignImpactedBookingResponse {
  booking: {
    id: string;
    professionalId: string;
    status: string;
  };
}

export interface CancelImpactedBookingResponse {
  booking: {
    id: string;
    status: string;
    notification: {
      emailSent: boolean;
    };
  };
}
