import { useQuery } from "@tanstack/react-query";
import { catalogService } from "@/services/catalog-service";
import type { PublicCatalogResponse } from "@/types/service";

export function usePublicCatalogQuery(slug: string | undefined) {
  return useQuery({
    queryKey: ["public-catalog", slug],
    queryFn: async () => {
      if (!slug) {
        return { professional: null, services: [] };
      }
      return catalogService.getCatalog(slug);
    },
    enabled: Boolean(slug),
    retry: false,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useServicesQuery() {
  return useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const response = await import("@/services/services-service").then((m) => m.servicesService.list());
      return response.services;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
