export interface Service {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListServicesResponse {
  services: Service[];
}

export interface CreateServiceInput {
  name: string;
}

export interface CreateServiceResponse {
  service: Service;
}

