import { beforeEach, describe, expect, test } from "vitest";
import {
  captureAcquisitionAttribution,
  getAcquisitionAttribution,
} from "./acquisition-attribution";

const STORAGE_KEY = "agendoro:acquisition:first-touch";

describe("acquisition attribution", () => {
  beforeEach(() => {
    const values = new Map<string, string>();
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
        removeItem: (key: string) => values.delete(key),
        clear: () => values.clear(),
      } satisfies Pick<Storage, "getItem" | "setItem" | "removeItem" | "clear">,
    });
    Object.defineProperty(document, "referrer", { configurable: true, value: "" });
    window.history.replaceState({}, "", "/");
  });

  test("captures UTM values as first touch", () => {
    window.history.replaceState(
      {},
      "",
      "/?utm_source=google&utm_medium=cpc&utm_campaign=lancamento",
    );

    const attribution = captureAcquisitionAttribution();

    expect(attribution).toEqual(
      expect.objectContaining({
        source: "google",
        medium: "cpc",
        campaign: "lancamento",
        landingPath: "/",
      }),
    );
    expect(attribution?.firstTouchAt).toBeTruthy();
    expect(attribution?.sessionId).toBeTruthy();
  });

  test("preserves original source when navigation changes", () => {
    window.history.replaceState({}, "", "/?utm_source=instagram&utm_medium=social");
    const first = captureAcquisitionAttribution();

    window.history.replaceState({}, "", "/signup?utm_source=google&utm_medium=cpc");
    const second = getAcquisitionAttribution();

    expect(second?.source).toBe("instagram");
    expect(second?.medium).toBe("social");
    expect(second?.sessionId).toBe(first?.sessionId);
  });

  test("falls back to direct without campaign parameters", () => {
    const attribution = captureAcquisitionAttribution();
    expect(attribution?.source).toBe("direct");
  });

  test.each([
    ["https://www.google.com/search?q=agenda", "google"],
    ["https://www.bing.com/search?q=agenda", "bing"],
    ["https://duckduckgo.com/?q=agenda", "duckduckgo"],
    ["https://search.yahoo.com/search?p=agenda", "yahoo"],
  ])("classifies %s as organic", (referrer, source) => {
    Object.defineProperty(document, "referrer", { configurable: true, value: referrer });

    const attribution = captureAcquisitionAttribution();

    expect(attribution).toEqual(expect.objectContaining({ source, medium: "organic", referrer: new URL(referrer).origin + new URL(referrer).pathname, landingPath: "/" }));
  });
});
