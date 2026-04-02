import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "./use-debounce";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return initial value immediately", () => {
    const { result } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: "initial", delay: 300 },
    });

    expect(result.current).toBe("initial");
  });

  it("should debounce the value", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "first", delay: 300 },
      }
    );

    rerender({ value: "second", delay: 300 });
    expect(result.current).toBe("first");

    act(() => {
      vi.advanceTimersByTime(300);
    });
    
    expect(result.current).toBe("second");
  });

  it("should update after specified delay", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "test", delay: 500 },
      }
    );

    rerender({ value: "updated", delay: 500 });

    expect(result.current).toBe("test");

    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(result.current).toBe("test");

    act(() => {
      vi.advanceTimersByTime(1);
    });
    
    expect(result.current).toBe("updated");
  });

  it("should clear timeout on unmount", () => {
    const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");

    const { unmount, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "test", delay: 300 },
      }
    );

    rerender({ value: "updated", delay: 300 });
    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
