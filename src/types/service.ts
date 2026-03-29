export interface Service {
  id: string;
  name: string;
  durationInMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface ListServicesResponse {
  services: Service[];
}

export interface CreateServiceInput {
  name: string;
  durationInMinutes: number;
}

export interface CreateServiceResponse {
  service: Service;
}
