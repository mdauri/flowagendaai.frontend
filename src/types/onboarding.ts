export type ActivationItemStatus = "PENDING" | "COMPLETED";
export type OnboardingVisibility = "VISIBLE" | "DISMISSED";

export interface ActivationItem {
  id: string;
  label: string;
  status: ActivationItemStatus;
  reason: string | null;
  href: string;
  videoKey: string;
  completedAt: string | null;
}

export interface ActivationStatus {
  visibility: OnboardingVisibility;
  isComplete: boolean;
  remainingSteps: number;
  items: ActivationItem[];
  publicUrl: string | null;
  testBookingUrl: string | null;
  milestones: {
    tenantCreatedAt: string;
    publishedAt: string | null;
    firstRealBookingAt: string | null;
    onboardingCompletedAt: string | null;
  };
  metrics: {
    timeToFirstRealBookingMs: number | null;
    timeToPublishMs: number | null;
    publishToFirstBookingMs: number | null;
  };
}

export interface OnboardingTestSession {
  token: string;
  expiresAt: string;
  publicUrl: string;
  bookingUrl: string;
}
