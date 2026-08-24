import { httpClient } from "@/lib/http-client";
import type { ActivationStatus, OnboardingTestSession } from "@/types/onboarding";

export const onboardingService = {
  async getActivation(): Promise<ActivationStatus> {
    return httpClient<ActivationStatus>("/onboarding/activation");
  },
  async createTestSession(): Promise<OnboardingTestSession> {
    return httpClient<OnboardingTestSession>("/onboarding/test-session", { method: "POST" });
  },
  async publish(): Promise<{ published: true; publishedAt: string; publicUrl: string }> {
    return httpClient("/onboarding/publish", { method: "POST" });
  },
};
