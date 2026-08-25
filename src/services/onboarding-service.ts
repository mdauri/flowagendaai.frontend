import { httpClient } from "@/lib/http-client";
import type { ActivationStatus, OnboardingTestSession, OnboardingVisibility } from "@/types/onboarding";

export const onboardingService = {
  async getActivation(): Promise<ActivationStatus> {
    return httpClient<ActivationStatus>("/onboarding/activation");
  },
  async setVisibility(visibility: OnboardingVisibility): Promise<{ visibility: OnboardingVisibility; changed: boolean }> {
    return httpClient<{ visibility: OnboardingVisibility; changed: boolean }>("/onboarding/visibility", {
      method: "PUT",
      body: JSON.stringify({ visibility }),
    });
  },
  async createTestSession(): Promise<OnboardingTestSession> {
    return httpClient<OnboardingTestSession>("/onboarding/test-session", { method: "POST" });
  },
  async publish(): Promise<{ published: true; publishedAt: string; publicUrl: string }> {
    return httpClient("/onboarding/publish", { method: "POST" });
  },
};
