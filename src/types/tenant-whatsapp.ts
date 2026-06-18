export type TenantWhatsappStatus = "connected" | "pending" | "inactive" | "error";

export interface TenantWhatsappIntegration {
  id: string;
  displayName: string | null;
  displayPhone: string | null;
  phoneNumberId: string;
  wabaId: string | null;
  status: TenantWhatsappStatus | string;
  isActive: boolean;
  accessTokenMasked: string | null;
  hasAccessToken: boolean;
  n8nEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TenantWhatsappUpsertInput {
  tenantId: string;
  displayName: string;
  displayPhone: string;
  phoneNumberId: string;
  wabaId: string;
  accessToken?: string;
  n8nEnabled?: boolean;
  isActive?: boolean;
}
