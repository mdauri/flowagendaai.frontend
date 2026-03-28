import { httpClient } from "@/lib/http-client";
import type {
  CreateServiceInput,
  CreateServiceResponse,
  ListServicesResponse,
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
};

