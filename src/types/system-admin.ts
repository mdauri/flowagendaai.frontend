export interface ProvisionTenantInput {
  tenant: {
    name: string;
    slug: string;
    timezone: string;
  };
  adminUser: {
    name: string;
    email: string;
  };
}

export interface ProvisionTenantResponse {
  tenant: {
    id: string;
    name: string;
    slug: string;
  };
  adminUser: {
    id: string;
    email: string;
  };
  createdAt: string;
}

export interface SystemAdminTenantListItem {
  id: string;
  name: string;
  slug: string;
}

export interface ListSystemAdminTenantsResponse {
  items: SystemAdminTenantListItem[];
}

export interface SystemAdminTenantDepositFeeSettings {
  tenant: {
    id: string;
    name: string;
    slug: string | null;
    depositModuleEnabled: boolean;
    depositConvenienceFeeEnabled: boolean;
  };
}

export interface UpdateSystemAdminTenantDepositFeeInput {
  depositModuleEnabled: boolean;
  depositConvenienceFeeEnabled: boolean;
}

export interface SystemAdminTenantSubscriptionClubSettings {
  tenant: {
    id: string;
    name: string;
    slug: string | null;
    subscriptionClubAllowed: boolean;
    subscriptionClubEnabled: boolean;
  };
}

export interface UpdateSystemAdminTenantSubscriptionClubInput {
  subscriptionClubAllowed: boolean;
}

export type SystemAdminTenantMetaWhatsappStatus =
  | "not_configured"
  | "connecting"
  | "active"
  | "error"
  | "disconnected";

export interface SystemAdminTenantMetaWhatsappStatusResponse {
  configured: boolean;
  status: SystemAdminTenantMetaWhatsappStatus;
  tenantId: string;
  provider: string | null;
  businessId: string | null;
  businessName: string | null;
  wabaId: string | null;
  phoneNumberId: string | null;
  displayPhoneNumber: string | null;
  verifiedName: string | null;
  hasAccessToken: boolean;
  tokenExpiresAt: string | null;
  webhookSubscribed: boolean;
  messagingEnabled: boolean;
  lastSyncAt: string | null;
  lastError: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface ConnectSystemAdminTenantMetaWhatsappInput {
  code: string;
  phoneNumberId?: string;
  wabaId?: string;
  businessId?: string;
}

export interface SendSystemAdminTenantMetaWhatsappTestMessageInput {
  toPhone: string;
}
