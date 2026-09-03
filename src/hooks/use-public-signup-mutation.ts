import { useMutation } from "@tanstack/react-query";
import { getAcquisitionAttribution } from "@/lib/acquisition-attribution";
import { trackFirstPartyEvent } from "@/lib/first-party-analytics";
import { setStoredToken } from "@/session/session-storage";
import { acquisitionService } from "@/services/acquisition-service";
import { signupService } from "@/services/signup-service";
import type { PublicSignupRequest } from "@/types/signup";

export function usePublicSignupMutation() {
  return useMutation({
    mutationFn: async (payload: PublicSignupRequest) => {
      const attribution = getAcquisitionAttribution();
      const result = await signupService.signup(payload);
      setStoredToken(result.accessToken);

      trackFirstPartyEvent({
        eventName: "signup_completed",
        pagePath: "/signup",
        landingPath: attribution?.landingPath,
      });

      if (attribution) {
        try {
          await acquisitionService.recordSignupAttribution(attribution);
        } catch {
          // Commercial telemetry must never invalidate a successful signup.
        }
      }

      return result;
    },
  });
}
