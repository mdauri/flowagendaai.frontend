export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthTenant {
  id: string;
  name: string;
  timezone: string;
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
