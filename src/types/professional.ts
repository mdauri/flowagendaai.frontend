export interface Professional {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListProfessionalsResponse {
  professionals: Professional[];
}

export interface CreateProfessionalInput {
  name: string;
}

export interface CreateProfessionalResponse {
  professional: Professional;
}

