import { httpClient } from "@/lib/http-client";
import type { CurrentUserResponse, LoginRequest, LoginResponse } from "@/types/auth";

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
};
