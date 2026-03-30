import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

beforeEach(() => {
  if (typeof window.localStorage?.clear === "function") {
    window.localStorage.clear();
  }

  if (typeof window.sessionStorage?.clear === "function") {
    window.sessionStorage.clear();
  }
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.restoreAllMocks();
});
