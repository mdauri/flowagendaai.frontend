import { httpClient } from "@/lib/http-client";
import type {
  CreateServiceInput,
  CreateServiceResponse,
  DeleteServiceResponse,
  ListServicesResponse,
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
    return httpClient<DeleteServiceResponse>(`/services/${id}`, {
      method: "DELETE",
    });
  },

  async requestUploadUrl(
    serviceId: string,
    payload: { filename: string; contentType: string },
  ): Promise<{ uploadUrl: string; imageUrl: string }> {
    return httpClient<{ uploadUrl: string; imageUrl: string }>(
      `/services/${serviceId}/image/upload-url`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  },

  async confirmUpload(
    serviceId: string,
    imageUrl: string,
    thumbnailUrl?: string,
  ): Promise<UpdateServiceResponse> {
    console.log("imageUrl", imageUrl);
    console.log("thumbnailUrl", thumbnailUrl);

    return httpClient<UpdateServiceResponse>(
      `/services/${serviceId}/image/confirm`,
      {
        method: "POST",
        body: JSON.stringify({
          imageUrl,
          thumbnailUrl: thumbnailUrl ?? imageUrl,
        }),
      },
    );
  },

  async deleteImage(serviceId: string): Promise<UpdateServiceResponse> {
    return httpClient<UpdateServiceResponse>(`/services/${serviceId}/image`, {
      method: "DELETE",
    });
  },
};
