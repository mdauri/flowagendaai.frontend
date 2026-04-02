import { useQuery } from "@tanstack/react-query";
import { catalogService } from "@/services/catalog-service";
import type { PublicCatalogResponse } from "@/types/service";

export function usePublicCatalogQuery(slug: string | undefined) {
  return useQuery({
    queryKey: ["public-catalog", slug],
    queryFn: async () => {
      if (!slug) {
        return { tenant: null, services: [] };
      }
      return catalogService.getCatalog(slug);
    },
    enabled: Boolean(slug),
    retry: false,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
