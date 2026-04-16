import { httpClient } from "@/lib/http-client";
import type {
  CreateApiTokenInput,
  CreateApiTokenResponse,
  ListApiTokensResponse,
} from "@/types/api-token";

export const apiTokensService = {
  async list(): Promise<ListApiTokensResponse> {
    return httpClient<ListApiTokensResponse>("/admin/api-tokens");
  },

  async create(input: CreateApiTokenInput): Promise<CreateApiTokenResponse> {
    return httpClient<CreateApiTokenResponse>("/admin/api-tokens", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async revoke(id: string): Promise<void> {
    await httpClient<void>(`/admin/api-tokens/${id}`, {
      method: "DELETE",
    });
  },
};
