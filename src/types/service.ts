export interface Service {
  id: string;
  tenantId: string;
  name: string;
  description?: string | null;
  durationInMinutes: number;
  price: number;
  imageUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListServicesResponse {
  services: Service[];
}

export interface CreateServiceInput {
  name: string;
  description?: string | null;
  durationInMinutes: number;
  price: number;
  imageUrl?: string | null;
  isActive?: boolean;
}

export interface UpdateServiceInput {
  name?: string;
  description?: string | null;
  durationInMinutes?: number;
  price?: number;
  imageUrl?: string | null;
  isActive?: boolean;
}

export interface CreateServiceResponse {
  service: Service;
}

export interface UpdateServiceResponse {
  service: Service;
}

export interface DeleteServiceResponse {
  success: boolean;
}

// Public Catalog types
export interface PublicCatalogProfessional {
  id: string;
  name: string;
  slug: string;
  tenantId: string;
  tenantName?: string | null;
  logoUrl?: string | null;
}

export interface PublicCatalogService {
  id: string;
  name: string;
  description?: string | null;
  durationInMinutes: number;
  price: number;
  imageUrl?: string | null;
}

export interface PublicCatalogResponse {
  professional: PublicCatalogProfessional;
  services: PublicCatalogService[];
}
