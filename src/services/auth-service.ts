import { httpClient } from "@/lib/http-client";
import type {
  CurrentUserResponse,
  ForgotRequest,
  ForgotResponse,
  LoginRequest,
  LoginResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from "@/types/auth";

export const authService = {
  login(payload: LoginRequest) {
    return httpClient<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
      skipAuth: true,
    });
  },
  me() {
    return httpClient<CurrentUserResponse>("/auth/me");
  },
  forgot(payload: ForgotRequest) {
    return httpClient<ForgotResponse>("/auth/forgot", {
      method: "POST",
      body: JSON.stringify(payload),
      skipAuth: true,
    });
  },
  resetPassword(payload: ResetPasswordRequest) {
    return httpClient<ResetPasswordResponse>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
      skipAuth: true,
    });
  },
};
