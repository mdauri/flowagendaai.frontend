import { httpClient } from "@/lib/http-client";
import type {
  CreateProfessionalInput,
  CreateProfessionalResponse,
  ListProfessionalsResponse,
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

