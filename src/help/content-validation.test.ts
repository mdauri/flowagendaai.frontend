import { describe, expect, it } from "vitest";
import { helpArticles, helpCategories } from "./content";
import { validateHelpContent } from "./content-validation";
import { officialOnboardingVideos } from "./videos";

describe("help content", () => {
  it("contains the approved categories and validates all links/videos", () => {
    expect(helpCategories).toHaveLength(12);
    expect(helpArticles.length).toBeGreaterThan(20);
    expect(validateHelpContent()).toEqual([]);
  });

  it("does not include the onboarding POC as an official video", () => {
    expect(Object.keys(officialOnboardingVideos)).not.toContain("first-professional-poc");
  });
});
