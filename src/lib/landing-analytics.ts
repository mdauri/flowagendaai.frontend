import { captureAcquisitionAttribution } from "@/lib/acquisition-attribution";

export type LandingEventName =
  | "landing_trial_cta_clicked"
  | "landing_pricing_clicked"
  | "landing_whatsapp_addon_clicked";

export type LandingEventSource =
  | "navbar"
  | "hero"
  | "how_it_works"
  | "pricing"
  | "final_cta";

export interface LandingEventPayload {
  sourceSection: LandingEventSource;
  target: string;
  planContext?: "agendoro" | "whatsapp_addon";
}

export function trackLandingEvent(
  name: LandingEventName,
  payload: LandingEventPayload
) {
  if (typeof window === "undefined") {
    return;
  }

  captureAcquisitionAttribution();

  window.dispatchEvent(
    new CustomEvent("agendoro:landing-event", {
      detail: {
        name,
        payload,
      },
    })
  );
}
