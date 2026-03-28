import { httpClient } from "@/lib/http-client";
import type {
  CreateProfessionalInput,
  CreateProfessionalResponse,
  ListProfessionalsResponse,
} from "@/types/professional";

export const professionalsService = {
  async list(): Promise<ListProfessionalsResponse> {
    return httpClient<ListProfessionalsResponse>("/professionals");
  },

  async create(
    input: CreateProfessionalInput
  ): Promise<CreateProfessionalResponse> {
    return httpClient<CreateProfessionalResponse>("/professionals", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};

