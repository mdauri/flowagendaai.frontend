import { beforeEach, describe, expect, test, vi } from "vitest";
import {
  buildFirstPartyEvent,
  trackFirstPartyEvent,
} from "./first-party-analytics";

describe("first-party analytics", () => {
  beforeEach(() => {
    const createStorage = () => {
      const values = new Map<string, string>();
      return {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
        removeItem: (key: string) => values.delete(key),
        clear: () => values.clear(),
      } satisfies Pick<Storage, "getItem" | "setItem" | "removeItem" | "clear">;
    };

    Object.defineProperty(window, "localStorage", { configurable: true, value: createStorage() });
    Object.defineProperty(window, "sessionStorage", { configurable: true, value: createStorage() });
    window.history.replaceState({}, "", "/sistema-agendamento-online?utm_source=google&utm_medium=cpc&utm_campaign=seo");
    window.localStorage.clear();
    window.sessionStorage.clear();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 204 })));
  });

  test("builds a minimal event with preserved first-touch attribution", () => {
    const event = buildFirstPartyEvent({ eventName: "page_view" });

    expect(event).toEqual(expect.objectContaining({
      eventName: "page_view",
      pagePath: "/sistema-agendamento-online",
      landingPath: "/sistema-agendamento-online",
      source: "google",
      medium: "cpc",
      campaign: "seo",
      sessionId: expect.any(String),
      firstTouchAt: expect.any(String),
      eventAt: expect.any(String),
      eventId: expect.any(String),
    }));
  });

  test("sends page view once and never sends personal data", async () => {
    trackFirstPartyEvent({ eventName: "page_view" });
    trackFirstPartyEvent({ eventName: "page_view" });
    await Promise.resolve();

    expect(fetch).toHaveBeenCalledTimes(1);
    const [, options] = vi.mocked(fetch).mock.calls[0];
    const payload = JSON.parse(String(options?.body));
    expect(payload).toEqual(expect.objectContaining({ eventName: "page_view" }));
    expect(Object.keys(payload)).not.toEqual(expect.arrayContaining([
      "password", "token", "email", "phone", "name", "card",
    ]));
  });

  test("does not reject when the analytics request fails", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("offline"));

    expect(() => trackFirstPartyEvent({ eventName: "cta_click", landingPath: "/" })).not.toThrow();
    await Promise.resolve();
  });
});
