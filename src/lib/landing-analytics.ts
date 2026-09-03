import { captureAcquisitionAttribution } from "@/lib/acquisition-attribution";

export type LandingEventName =
  | "landing_page_viewed"
  | "landing_trial_cta_clicked"
  | "landing_secondary_cta_clicked"
  | "landing_signup_started"
  | "landing_demo_clicked"
  | "landing_pricing_clicked"
  | "landing_whatsapp_addon_clicked";

export type LandingEventSource =
  | "navbar"
  | "hero"
  | "how_it_works"
  | "pricing"
  | "final_cta"
  | "page_view"
  | "secondary_cta";

export interface LandingEventPayload {
  sourceSection: LandingEventSource;
  target: string;
  landingPath?: string;
  planContext?: "agendoro" | "whatsapp_addon";
}

export function trackLandingEvent(
  name: LandingEventName,
  payload: LandingEventPayload
) {
  if (typeof window === "undefined") {
    return;
  }

  const attribution = captureAcquisitionAttribution();

  window.dispatchEvent(
    new CustomEvent("agendoro:landing-event", {
      detail: {
        name,
        payload,
        attribution,
      },
    })
  );
}
