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

export interface BusinessHour {
  dayOfWeek: number;
  dayName: string;
  isOpen: boolean;
  startTime: string | null;
  endTime: string | null;
}

export interface UpdateBusinessHoursInput {
  businessHours: Array<{
    dayOfWeek: number;
    isOpen: boolean;
    startTime?: string | null;
    endTime?: string | null;
  }>;
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

  async getBusinessHours(): Promise<{ businessHours: BusinessHour[] }> {
    return httpClient<{ businessHours: BusinessHour[] }>("/tenants/me/business-hours");
  },

  async updateBusinessHours(input: UpdateBusinessHoursInput): Promise<void> {
    await httpClient("/tenants/me/business-hours", {
      method: "PUT",
      body: JSON.stringify(input),
    });
  },
};
