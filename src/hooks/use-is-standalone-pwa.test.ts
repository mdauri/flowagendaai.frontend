import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useIsStandalonePwa } from "./use-is-standalone-pwa";

function installMatchMedia(initialMatches: boolean) {
  let matches = initialMatches;
  const listeners = new Set<() => void>();
  const mediaQuery = {
    get matches() {
      return matches;
    },
    media: "(display-mode: standalone)",
    onchange: null,
    addEventListener: vi.fn((_type: string, listener: () => void) => listeners.add(listener)),
    removeEventListener: vi.fn((_type: string, listener: () => void) => listeners.delete(listener)),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as unknown as MediaQueryList;

  const matchMedia = vi.fn(() => mediaQuery);
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: matchMedia,
  });

  return {
    mediaQuery,
    setMatches(next: boolean) {
      matches = next;
      listeners.forEach((listener) => listener());
    },
  };
}

function setIosStandalone(value: boolean | undefined) {
  Object.defineProperty(window.navigator, "standalone", {
    configurable: true,
    value,
  });
}

afterEach(() => {
  setIosStandalone(undefined);
});

describe("useIsStandalonePwa", () => {
  it("returns false in a regular browser", () => {
    installMatchMedia(false);
    setIosStandalone(false);

    const { result } = renderHook(() => useIsStandalonePwa());

    expect(result.current).toBe(false);
  });

  it("returns true when display mode is standalone", () => {
    installMatchMedia(true);

    const { result } = renderHook(() => useIsStandalonePwa());

    expect(result.current).toBe(true);
  });

  it("returns true for iOS standalone mode", () => {
    installMatchMedia(false);
    setIosStandalone(true);

    const { result } = renderHook(() => useIsStandalonePwa());

    expect(result.current).toBe(true);
  });

  it("reacts to display mode changes and removes the listener", () => {
    const displayMode = installMatchMedia(false);
    const { result, unmount } = renderHook(() => useIsStandalonePwa());

    act(() => displayMode.setMatches(true));

    expect(result.current).toBe(true);
    unmount();
    expect(displayMode.mediaQuery.removeEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );
  });
});
