import { httpClient } from "@/lib/http-client";

export interface UpdateTenantInput {
  name?: string;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  publicAddress?: string | null;
}

export interface UpdateTenantResponse {
  id: string;
  name: string;
  slug: string | null;
  timezone: string;
  logoUrl: string | null;
  coverImageUrl: string | null;
  publicAddress: string | null;
}

export interface GeocodeInput {
  latitude: number;
  longitude: number;
}

export interface GeocodeResponse {
  formattedAddress: string;
}

export const tenantService = {
  async updateTenant(input: UpdateTenantInput): Promise<UpdateTenantResponse> {
    return httpClient<UpdateTenantResponse>("/tenants/me", {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  async geocode(input: GeocodeInput): Promise<GeocodeResponse> {
    return httpClient<GeocodeResponse>("/tenants/me/geocode", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};
