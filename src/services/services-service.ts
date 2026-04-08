import { httpClient } from "@/lib/http-client";
import type {
  CreateServiceInput,
  CreateServiceResponse,
  DeleteServiceResponse,
  ListServicesResponse,
  ServiceImageConfirmResponse,
  ServiceImageUploadUrlResponse,
  UpdateServiceInput,
  UpdateServiceResponse,
} from "@/types/service";

export const servicesService = {
  async list(): Promise<ListServicesResponse> {
    return httpClient<ListServicesResponse>("/services");
  },

  async create(input: CreateServiceInput): Promise<CreateServiceResponse> {
    return httpClient<CreateServiceResponse>("/services", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async update(
    id: string,
    input: UpdateServiceInput,
  ): Promise<UpdateServiceResponse> {
    return httpClient<UpdateServiceResponse>(`/services/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  },

  async delete(id: string): Promise<DeleteServiceResponse> {
    return httpClient<void>(`/services/${id}`, {
      method: "DELETE",
    });
  },

  async requestUploadUrl(
    serviceId: string,
    payload: { filename: string; contentType: string },
  ): Promise<ServiceImageUploadUrlResponse> {
    return httpClient<ServiceImageUploadUrlResponse>(
      `/services/${serviceId}/image/upload-url`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  },

  async confirmUpload(
    serviceId: string,
    objectKey: string,
  ): Promise<ServiceImageConfirmResponse> {
    return httpClient<ServiceImageConfirmResponse>(
      `/services/${serviceId}/image/confirm`,
      {
        method: "POST",
        body: JSON.stringify({
          objectKey,
        }),
      },
    );
  },

  async deleteImage(serviceId: string): Promise<void> {
    return httpClient<void>(`/services/${serviceId}/image`, {
      method: "DELETE",
    });
  },
};
