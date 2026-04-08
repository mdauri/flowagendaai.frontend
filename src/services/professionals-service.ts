import { httpClient } from "@/lib/http-client";
import type {
  CancelImpactedBookingResponse,
  CreateProfessionalInput,
  CreateProfessionalResponse,
  DeleteProfessionalResponse,
  ImpactedProfessionalBookingsResponse,
  ListProfessionalsResponse,
  ProfessionalImageConfirmResponse,
  ProfessionalImageUploadUrlResponse,
  ReassignImpactedBookingInput,
  ReassignImpactedBookingResponse,
  UpdateProfessionalInput,
  UpdateProfessionalResponse,
} from "@/types/professional";
import type {
  ProfessionalWithServices,
  BulkOperationResult,
} from "@/types/professional-service";

export interface ProfessionalsListOptions {
  includeServices?: boolean;
}

export interface ProfessionalsListResponse {
  professionals: ProfessionalWithServices[];
}

export const professionalsService = {
  async list(): Promise<ListProfessionalsResponse> {
    return httpClient<ListProfessionalsResponse>("/professionals");
  },

  async listWithServices(): Promise<ProfessionalsListResponse> {
    return httpClient<ProfessionalsListResponse>(
      "/professionals?includeServices=true"
    );
  },

  async create(
    input: CreateProfessionalInput
  ): Promise<CreateProfessionalResponse> {
    return httpClient<CreateProfessionalResponse>("/professionals", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async update(
    professionalId: string,
    input: UpdateProfessionalInput
  ): Promise<UpdateProfessionalResponse> {
    return httpClient<UpdateProfessionalResponse>(`/professionals/${professionalId}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  },

  async delete(professionalId: string): Promise<DeleteProfessionalResponse> {
    return httpClient<DeleteProfessionalResponse>(`/professionals/${professionalId}`, {
      method: "DELETE",
    });
  },

  async listImpactedBookings(
    professionalId: string
  ): Promise<ImpactedProfessionalBookingsResponse> {
    return httpClient<ImpactedProfessionalBookingsResponse>(
      `/professionals/${professionalId}/impacted-bookings`
    );
  },

  async reassignImpactedBooking(
    professionalId: string,
    bookingId: string,
    input: ReassignImpactedBookingInput
  ): Promise<ReassignImpactedBookingResponse> {
    return httpClient<ReassignImpactedBookingResponse>(
      `/professionals/${professionalId}/impacted-bookings/${bookingId}/reassign`,
      {
        method: "POST",
        body: JSON.stringify(input),
      }
    );
  },

  async cancelImpactedBooking(
    professionalId: string,
    bookingId: string
  ): Promise<CancelImpactedBookingResponse> {
    return httpClient<CancelImpactedBookingResponse>(
      `/professionals/${professionalId}/impacted-bookings/${bookingId}/cancel`,
      {
        method: "POST",
      }
    );
  },

  async finalizeRemoval(professionalId: string): Promise<DeleteProfessionalResponse> {
    return httpClient<DeleteProfessionalResponse>(
      `/professionals/${professionalId}/finalize-removal`,
      {
        method: "POST",
      }
    );
  },

  async requestImageUploadUrl(
    professionalId: string,
    payload: { filename: string; contentType: string },
  ): Promise<ProfessionalImageUploadUrlResponse> {
    return httpClient<ProfessionalImageUploadUrlResponse>(
      `/professionals/${professionalId}/image/upload-url`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  },

  async confirmImageUpload(
    professionalId: string,
    objectKey: string,
  ): Promise<ProfessionalImageConfirmResponse> {
    return httpClient<ProfessionalImageConfirmResponse>(
      `/professionals/${professionalId}/image/confirm`,
      {
        method: "POST",
        body: JSON.stringify({ objectKey }),
      },
    );
  },

  async deleteImage(professionalId: string): Promise<void> {
    return httpClient<void>(`/professionals/${professionalId}/image`, {
      method: "DELETE",
    });
  },

  /**
   * Associate a service with a professional
   */
  async associateService(
    professionalId: string,
    serviceId: string
  ): Promise<void> {
    return httpClient<void>(
      `/professionals/${professionalId}/services`,
      {
        method: "POST",
        body: JSON.stringify({ serviceId }),
      }
    );
  },

  /**
   * Dissociate a service from a professional
   */
  async dissociateService(
    professionalId: string,
    serviceId: string
  ): Promise<void> {
    return httpClient<void>(
      `/professionals/${professionalId}/services/${serviceId}`,
      {
        method: "DELETE",
      }
    );
  },

  /**
   * Bulk associate service with multiple professionals
   */
  async bulkAssociate(
    professionalIds: string[],
    serviceId: string
  ): Promise<BulkOperationResult> {
    const results = await Promise.allSettled(
      professionalIds.map((id) => this.associateService(id, serviceId))
    );

    return this.processBulkResults(results);
  },

  /**
   * Bulk dissociate service from multiple professionals
   */
  async bulkDissociate(
    professionalIds: string[],
    serviceId: string
  ): Promise<BulkOperationResult> {
    const results = await Promise.allSettled(
      professionalIds.map((id) => this.dissociateService(id, serviceId))
    );

    return this.processBulkResults(results);
  },

  /**
   * Process bulk operation results
   */
  processBulkResults(
    results: PromiseSettledResult<unknown>[]
  ): BulkOperationResult {
    const successes = results.filter((r) => r.status === "fulfilled").length;
    const failures = results.filter((r) => r.status === "rejected").length;

    return {
      total: results.length,
      successes,
      failures,
      succeeded: successes === results.length,
      partialSuccess: successes > 0 && failures > 0,
    };
  },
};
