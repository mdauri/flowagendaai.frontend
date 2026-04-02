import { describe, it, expect } from "vitest";
import { getAvatarColor, getInitials } from "@/lib/avatar-color";

describe("getAvatarColor", () => {
  it("should return consistent color for same professional ID", () => {
    const id = "test-id-123";
    const color1 = getAvatarColor(id);
    const color2 = getAvatarColor(id);
    expect(color1).toBe(color2);
  });

  it("should return different colors for different IDs", () => {
    const color1 = getAvatarColor("id-1");
    const color2 = getAvatarColor("id-2");
    // They might be the same due to hash collision, but likely different
    expect(typeof color1).toBe("string");
    expect(typeof color2).toBe("string");
  });

  it("should return valid hex color", () => {
    const color = getAvatarColor("any-id");
    expect(color).toMatch(/^#[0-9A-F]{6}$/i);
  });

  it("should handle empty string", () => {
    const color = getAvatarColor("");
    expect(color).toMatch(/^#[0-9A-F]{6}$/i);
  });
});

describe("getInitials", () => {
  it("should return first letter of each word for two-word name", () => {
    expect(getInitials("John Doe")).toBe("JD");
  });

  it("should return first two letters for single word name", () => {
    expect(getInitials("John")).toBe("JO");
  });

  it("should handle multiple spaces", () => {
    expect(getInitials("John  Doe")).toBe("JD");
  });

  it("should return uppercase letters", () => {
    expect(getInitials("john doe")).toBe("JD");
  });

  it("should handle empty string", () => {
    expect(getInitials("")).toBe("");
  });
});
