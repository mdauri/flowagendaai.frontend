import { httpClient } from "@/lib/http-client";
import type {
  CreateApiTokenInput,
  CreateApiTokenResponse,
  ListApiTokensResponse,
} from "@/types/api-token";

export const apiTokensService = {
  async list(tenantId: string): Promise<ListApiTokensResponse> {
    const searchParams = new URLSearchParams({ tenantId });
    return httpClient<ListApiTokensResponse>(`/admin/api-tokens?${searchParams.toString()}`);
  },

  async create(input: CreateApiTokenInput): Promise<CreateApiTokenResponse> {
    return httpClient<CreateApiTokenResponse>("/admin/api-tokens", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async revoke(id: string, tenantId: string): Promise<void> {
    const searchParams = new URLSearchParams({ tenantId });
    await httpClient<void>(`/admin/api-tokens/${id}?${searchParams.toString()}`, {
      method: "DELETE",
    });
  },
};
