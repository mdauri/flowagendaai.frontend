import { httpClient } from "@/lib/http-client";
import type { PublicCatalogResponse, ProfessionalsByServiceResponse } from "@/types/service";

export const catalogService = {
  async getCatalog(slug: string): Promise<PublicCatalogResponse> {
    return httpClient<PublicCatalogResponse>(`/public/catalog/${slug}`, {
      skipAuth: true,
    });
  },

  async getProfessionalsByService(serviceId: string): Promise<ProfessionalsByServiceResponse> {
    return httpClient<ProfessionalsByServiceResponse>(`/public/services/${serviceId}/professionals`, {
      skipAuth: true,
    });
  },
};
