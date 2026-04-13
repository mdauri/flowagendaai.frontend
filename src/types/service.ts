export interface Service {
  id: string;
  tenantId: string;
  name: string;
  description?: string | null;
  durationInMinutes: number;
  price: number;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
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

export type DeleteServiceResponse = void;

export interface ServiceImageUploadUrlResponse {
  uploadUrl: string;
  objectKey: string;
  imageUrl: string;
}

export interface ServiceImageConfirmResponse {
  imageUrl: string;
  thumbnailUrl: string;
}

// Public Catalog types
export interface PublicCatalogTenant {
  id: string;
  name: string;
  slug: string | null;
  timezone: string;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  publicAddress?: string | null;
}

export interface PublicCatalogService {
  id: string;
  name: string;
  description?: string | null;
  durationInMinutes: number;
  price: number;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
}

export interface PublicCatalogResponse {
  tenant: PublicCatalogTenant;
  services: PublicCatalogService[];
}

export interface ProfessionalsByServiceResponse {
  serviceId: string;
  serviceName: string;
  professionals: {
    id: string;
    name: string;
    slug: string;
    imageUrl?: string | null;
    thumbnailUrl?: string | null;
  }[];
}
