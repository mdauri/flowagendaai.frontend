import { httpClient } from "@/lib/http-client";

export interface LogoUploadUrlRequest {
  filename: string;
  contentType: string;
}

export interface LogoUploadUrlResponse {
  uploadUrl: string;
  objectKey: string;
}

export interface LogoConfirmRequest {
  objectKey: string;
}

export interface LogoConfirmResponse {
  logoUrl: string;
}

export interface LogoRemoveResponse {
  logoUrl: null;
}

export const tenantLogoImageService = {
  async getUploadUrl(
    payload: LogoUploadUrlRequest,
  ): Promise<LogoUploadUrlResponse> {
    return httpClient<LogoUploadUrlResponse>(
      "/tenants/me/logo-image/upload-url",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  },

  async confirmUpload(
    payload: LogoConfirmRequest,
  ): Promise<LogoConfirmResponse> {
    return httpClient<LogoConfirmResponse>(
      "/tenants/me/logo-image/confirm",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  },

  async removeLogo(): Promise<LogoRemoveResponse> {
    return httpClient<LogoRemoveResponse>(
      "/tenants/me/logo-image",
      {
        method: "DELETE",
      },
    );
  },
};
