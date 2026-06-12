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
