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
  test("preserves opaque outbound prospect across booking, reload reads and another campaign", () => {
    const prospectId = "49d52765-1f72-4bdf-9015-4bdf7bbfa8de";
    window.history.replaceState({}, "", `/c/barbearia-dom-pedro/catalog?utm_source=outbound&utm_medium=whatsapp&utm_campaign=barbearias-jacarei-v1&prospect_id=${prospectId}`);
    const first = captureAcquisitionAttribution();
    window.history.replaceState({}, "", "/p/barbearia-dom-pedro-joao?service=dom-pedro-corte");
    expect(getAcquisitionAttribution()).toEqual(first);
    window.history.replaceState({}, "", "/signup?utm_source=other&prospect_id=425e36d2-0ee9-44e3-83c6-42f3e8b0c1fa");
    expect(getAcquisitionAttribution()).toEqual(first);
    expect(first).toMatchObject({ prospectId, source: "outbound", medium: "whatsapp", campaign: "barbearias-jacarei-v1" });
  });

  test.each(["Joao", "11999999999", "joao@example.com", "49d52765-1f72-1bdf-9015-4bdf7bbfa8de", "49d52765-1f72-4bdf-9015-4bdf7bbfa8de&prospect_id=duplicate"])("discards invalid or ambiguous prospect %s", (value) => {
    window.history.replaceState({}, "", `/?utm_source=outbound&prospect_id=${value}`);
    expect(captureAcquisitionAttribution()?.prospectId).toBeUndefined();
    expect(window.localStorage.getItem(STORAGE_KEY)).not.toContain(value);
  });

  test("discards an invalid prospect from stored attribution", () => {
    const first = captureAcquisitionAttribution();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...first, prospectId: "customer@example.com" }));
    expect(getAcquisitionAttribution()?.prospectId).toBeUndefined();
  });

  test("storage failure never blocks navigation and keeps first touch in memory within this page", () => {
    window.history.replaceState({}, "", "/?utm_source=outbound");
    const first = captureAcquisitionAttribution();
    Object.defineProperty(window, "localStorage", { configurable: true, get: () => { throw new Error("storage blocked"); } });
    window.history.replaceState({}, "", "/signup");
    expect(getAcquisitionAttribution()).toEqual(first);
  });

});
