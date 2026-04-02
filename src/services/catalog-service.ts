import { httpClient } from "@/lib/http-client";
import type { PublicCatalogResponse } from "@/types/service";

export const catalogService = {
  async getCatalog(slug: string): Promise<PublicCatalogResponse> {
    return httpClient<PublicCatalogResponse>(`/public/catalog/${slug}`, {
      skipAuth: true,
    });
  },
};
