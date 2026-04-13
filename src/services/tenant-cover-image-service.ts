import { httpClient } from "@/lib/http-client";

export interface CoverImageUploadUrlRequest {
  filename: string;
  contentType: string;
}

export interface CoverImageUploadUrlResponse {
  uploadUrl: string;
  objectKey: string;
}

export interface CoverImageConfirmRequest {
  objectKey: string;
}

export interface CoverImageConfirmResponse {
  coverImageUrl: string;
  coverImageThumbUrl: string;
}

export interface CoverImageRemoveResponse {
  coverImageUrl: null;
}

export const tenantCoverImageService = {
  async getUploadUrl(
    payload: CoverImageUploadUrlRequest,
  ): Promise<CoverImageUploadUrlResponse> {
    return httpClient<CoverImageUploadUrlResponse>(
      "/tenants/me/cover-image/upload-url",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  },

  async confirmUpload(
    payload: CoverImageConfirmRequest,
  ): Promise<CoverImageConfirmResponse> {
    return httpClient<CoverImageConfirmResponse>(
      "/tenants/me/cover-image/confirm",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  },

  async removeCoverImage(): Promise<CoverImageRemoveResponse> {
    return httpClient<CoverImageRemoveResponse>(
      "/tenants/me/cover-image",
      {
        method: "DELETE",
      },
    );
  },
};
