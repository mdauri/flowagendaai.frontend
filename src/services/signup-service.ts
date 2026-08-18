import { httpClient } from "@/lib/http-client";
import type { PublicSignupRequest, PublicSignupResponse } from "@/types/signup";

export const signupService = {
  signup(payload: PublicSignupRequest) {
    return httpClient<PublicSignupResponse>("/public/signup", {
      method: "POST",
      body: JSON.stringify(payload),
      skipAuth: true,
    });
  },
};
