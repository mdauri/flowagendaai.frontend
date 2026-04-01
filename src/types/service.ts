export interface Service {
  id: string;
  name: string;
  description?: string | null;
  durationInMinutes: number;
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
}

export interface CreateServiceResponse {
  service: Service;
}
