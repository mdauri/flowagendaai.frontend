export interface OnboardingVideoManifest {
  version: string;
  videos: Record<string, string>;
}

let manifestPromise: Promise<OnboardingVideoManifest | null> | null = null;

export function getOnboardingVideoManifest(): Promise<OnboardingVideoManifest | null> {
  if (!manifestPromise) {
    manifestPromise = fetch("/onboarding-videos/manifest.json", { cache: "no-store" })
      .then((response) => response.ok ? response.json() as Promise<OnboardingVideoManifest> : null)
      .catch(() => null);
  }
  return manifestPromise;
}
