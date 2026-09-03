import { captureAcquisitionAttribution, getAcquisitionAttribution } from "@/lib/acquisition-attribution";
import { httpClient } from "@/lib/http-client";

export type FirstPartyEventName =
  | "page_view"
  | "cta_click"
  | "demo_click"
  | "signup_started"
  | "signup_completed";

export interface FirstPartyEventInput {
  eventName: FirstPartyEventName;
  pagePath?: string;
  landingPath?: string;
}

export interface FirstPartyEventPayload {
  eventId: string;
  eventName: FirstPartyEventName;
  eventAt: string;
  pagePath: string;
  landingPath: string;
  source: string;
  medium: string | null;
  campaign: string | null;
  sessionId: string;
  firstTouchAt: string;
}

const DEDUPE_PREFIX = "agendoro:analytics:sent:";
const inFlight = new Set<string>();

function createEventId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `event-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

function canSendOnce(key: string) {
  if (inFlight.has(key)) return false;
  inFlight.add(key);

  try {
    const storageKey = `${DEDUPE_PREFIX}${key}`;
    if (window.sessionStorage.getItem(storageKey)) return false;
    window.sessionStorage.setItem(storageKey, "1");
  } catch {
    // Analytics remains best-effort when browser storage is unavailable.
  }

  return true;
}

export function buildFirstPartyEvent(input: FirstPartyEventInput): FirstPartyEventPayload | null {
  if (typeof window === "undefined") return null;

  const attribution = getAcquisitionAttribution() ?? captureAcquisitionAttribution();
  if (!attribution) return null;

  return {
    eventId: createEventId(),
    eventName: input.eventName,
    eventAt: new Date().toISOString(),
    pagePath: input.pagePath ?? window.location.pathname,
    landingPath: input.landingPath ?? attribution.landingPath ?? window.location.pathname,
    source: attribution.source,
    medium: attribution.medium ?? null,
    campaign: attribution.campaign ?? null,
    sessionId: attribution.sessionId,
    firstTouchAt: attribution.firstTouchAt,
  };
}

export function trackFirstPartyEvent(input: FirstPartyEventInput): void {
  if (typeof window === "undefined") return;

  const dedupeKey = [input.eventName, input.pagePath ?? window.location.pathname, input.landingPath ?? ""].join(":");
  if (input.eventName === "page_view" || input.eventName === "signup_started") {
    if (!canSendOnce(dedupeKey)) return;
  }

  const payload = buildFirstPartyEvent(input);
  if (!payload) return;

  void httpClient<void>("/acquisition/events", {
    method: "POST",
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {
    // Analytics must never block navigation or signup.
  });
}
