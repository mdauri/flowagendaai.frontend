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
          attribution: expect.anything(),
        },
      })
    );

    window.removeEventListener("agendoro:landing-event", listener);
  });

  test("preserva a atribuição no evento de página comercial", () => {
    const listener = vi.fn();
    window.addEventListener("agendoro:landing-event", listener);

    trackLandingEvent("landing_page_viewed", {
      sourceSection: "page_view",
      target: "/agenda-online-salao-beleza",
      landingPath: "/agenda-online-salao-beleza",
    });

    expect(listener).toHaveBeenCalledWith(expect.objectContaining({
      detail: expect.objectContaining({
        name: "landing_page_viewed",
        attribution: expect.objectContaining({ sessionId: expect.any(String), firstTouchAt: expect.any(String), landingPath: expect.any(String) }),
      }),
    }));
    window.removeEventListener("agendoro:landing-event", listener);
  });
});
