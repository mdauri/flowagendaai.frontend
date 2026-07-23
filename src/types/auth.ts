export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  roles?: string[];
  professionalId?: string | null;
}

export interface AuthTenant {
  id: string;
  name: string;
  timezone: string;
  slug: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  publicAddress: string | null;
  description: string | null;
  reactivationEnabled?: boolean;
  daysAfterLastService?: number;
  reactivationCooldownDays?: number;
  reactivationTemplateName?: string | null;
  reactivationPushEnabled?: boolean;
  reactivationWhatsappEnabled?: boolean;
  reactivationEmailEnabled?: boolean;
  depositModuleEnabled: boolean;
  depositPaymentProvider: "MANUAL" | "MERCADO_PAGO";
  depositProviderConfigured: boolean;
  mercadoPagoPublicKey: string | null;
  depositConvenienceFeeEnabled: boolean;
  metaWhatsappEnabled?: boolean;
  subscriptionClubAllowed?: boolean;
  subscriptionClubEnabled?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresIn: string;
  user: AuthUser;
  tenant: AuthTenant;
}

export interface ForgotRequest {
  email: string;
}

export interface ForgotResponse {
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface CurrentUserResponse {
  user: AuthUser;
  tenant: AuthTenant;
}

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
  tenant: AuthTenant | null;
  isAuthenticated: boolean;
}
