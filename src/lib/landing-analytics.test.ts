import { describe, expect, test, vi } from "vitest";
import { trackLandingEvent } from "./landing-analytics";

describe("trackLandingEvent", () => {
  test("dispara CustomEvent local sem dependencia externa", () => {
    const listener = vi.fn();
    window.addEventListener("agendoro:landing-event", listener);

    trackLandingEvent("landing_pricing_clicked", {
      sourceSection: "pricing",
      target: "#precos",
      planContext: "agendoro",
    });

    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          name: "landing_pricing_clicked",
          payload: {
            sourceSection: "pricing",
            target: "#precos",
            planContext: "agendoro",
          },
        },
      })
    );

    window.removeEventListener("agendoro:landing-event", listener);
  });
});
