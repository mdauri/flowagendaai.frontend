import { beforeEach, describe, expect, test } from "vitest";
import {
  captureAcquisitionAttribution,
  getAcquisitionAttribution,
} from "./acquisition-attribution";

const STORAGE_KEY = "agendoro:acquisition:first-touch";

describe("acquisition attribution", () => {
  beforeEach(() => {
    window.localStorage.removeItem(STORAGE_KEY);
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
        landingPath: "/?utm_source=google&utm_medium=cpc&utm_campaign=lancamento",
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
});
