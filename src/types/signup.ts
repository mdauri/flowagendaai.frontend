import type { AuthTenant, AuthUser } from "@/types/auth";

export interface PublicSignupRequest {
  responsibleName: string;
  email: string;
  phone: string;
  cpfCnpj: string;
  companyName: string;
  password: string;
  acceptedTerms: boolean;
}

export interface PublicSignupTrial {
  status: "TRIALING";
  startsAt: string;
  endsAt: string;
}

export interface PublicSignupResponse {
  accessToken: string;
  expiresIn: string;
  user: AuthUser;
  tenant: AuthTenant;
  trial: PublicSignupTrial;
}
