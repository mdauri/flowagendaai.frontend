import { captureAcquisitionAttribution } from "@/lib/acquisition-attribution";
import { trackFirstPartyEvent, type FirstPartyEventName } from "@/lib/first-party-analytics";

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

function toFirstPartyEventName(name: LandingEventName): FirstPartyEventName {
  if (name === "landing_page_viewed") return "page_view";
  if (name === "landing_demo_clicked") return "demo_click";
  if (name === "landing_signup_started") return "signup_started";
  return "cta_click";
}

export function trackLandingEvent(
  name: LandingEventName,
  payload: LandingEventPayload
) {
  if (typeof window === "undefined") {
    return;
  }

  const attribution = captureAcquisitionAttribution();

  trackFirstPartyEvent({
    eventName: toFirstPartyEventName(name),
    landingPath: payload.landingPath ?? attribution?.landingPath,
  });

  if (payload.target === "/signup" && toFirstPartyEventName(name) === "cta_click") {
    trackFirstPartyEvent({
      eventName: "signup_started",
      landingPath: payload.landingPath ?? attribution?.landingPath,
    });
  }

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
