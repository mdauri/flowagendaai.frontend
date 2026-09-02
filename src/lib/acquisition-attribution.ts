export interface AcquisitionAttribution {
  source: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
  referrer?: string;
  landingPath?: string;
  firstTouchAt: string;
  sessionId: string;
}

const STORAGE_KEY = "agendoro:acquisition:first-touch";

function safeValue(value: string | null, maxLength = 160): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, maxLength) : undefined;
}

function safeReferrer(value: string | null): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  try {
    const url = new URL(trimmed);
    return `${url.origin}${url.pathname}`.slice(0, 1000);
  } catch {
    return undefined;
  }
}

const SEARCH_ENGINES = new Map([
  ["google.", "google"],
  ["bing.com", "bing"],
  ["duckduckgo.com", "duckduckgo"],
  ["search.yahoo.com", "yahoo"],
]);

function organicSource(referrer: string | undefined): string | undefined {
  if (!referrer) return undefined;
  try {
    const hostname = new URL(referrer).hostname.toLowerCase();
    return [...SEARCH_ENGINES].find(([fragment]) => hostname.includes(fragment))?.[1];
  } catch {
    return undefined;
  }
}

function createSessionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `acq-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

function readStored(): AcquisitionAttribution | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AcquisitionAttribution>;
    if (
      typeof parsed.source !== "string" ||
      typeof parsed.firstTouchAt !== "string" ||
      typeof parsed.sessionId !== "string" ||
      parsed.source.length > 120 ||
      parsed.sessionId.length > 120
    ) {
      return null;
    }
    return parsed as AcquisitionAttribution;
  } catch {
    return null;
  }
}

function writeStored(value: AcquisitionAttribution) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Attribution must never block navigation or signup.
  }
}

export function captureAcquisitionAttribution(): AcquisitionAttribution | null {
  if (typeof window === "undefined") {
    return null;
  }

  const existing = readStored();
  if (existing) {
    return existing;
  }

  const params = new URLSearchParams(window.location.search);
  const source = safeValue(params.get("utm_source"));
  const medium = safeValue(params.get("utm_medium"));
  const campaign = safeValue(params.get("utm_campaign"));
  const term = safeValue(params.get("utm_term"));
  const content = safeValue(params.get("utm_content"));
  const referrer = safeReferrer(document.referrer);
  const searchSource = organicSource(referrer);

  const attribution: AcquisitionAttribution = {
    source: source ?? searchSource ?? (referrer ? "referral" : "direct"),
    medium: medium ?? (searchSource ? "organic" : undefined),
    campaign,
    term,
    content,
    referrer,
    landingPath: window.location.pathname.slice(0, 1000),
    firstTouchAt: new Date().toISOString(),
    sessionId: createSessionId(),
  };

  writeStored(attribution);
  return attribution;
}

export function getAcquisitionAttribution(): AcquisitionAttribution | null {
  return readStored() ?? captureAcquisitionAttribution();
}
