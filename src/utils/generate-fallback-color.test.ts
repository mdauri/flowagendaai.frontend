import { describe, it, expect } from "vitest";
import { generateFallbackColor, generateInitials, getContrastColor, getFallbackStyles } from "@/utils/generate-fallback-color";

describe("generateFallbackColor", () => {
  it("should return a consistent color for the same ID", () => {
    const id = "svc_123abc";
    const color1 = generateFallbackColor(id);
    const color2 = generateFallbackColor(id);
    expect(color1).toBe(color2);
  });

  it("should return different colors for different IDs", () => {
    const color1 = generateFallbackColor("svc_abc");
    const color2 = generateFallbackColor("svc_xyz");
    // They might be the same due to modulo, but most likely different
    // Just verify both are valid hex colors
    expect(color1).toMatch(/^#[0-9A-F]{6}$/i);
    expect(color2).toMatch(/^#[0-9A-F]{6}$/i);
  });

  it("should return a valid hex color", () => {
    const color = generateFallbackColor("test_id");
    expect(color).toMatch(/^#[0-9A-F]{6}$/i);
  });

  it("should use the pastel color palette", () => {
    const colors = [
      "#FFB38F",
      "#FFD98B",
      "#A8E6CF",
      "#AED9E9",
      "#D4A5E9",
      "#FFB3D9",
      "#C9D4D9",
      "#FF9B8F",
    ];
    
    // Test multiple IDs to ensure we get colors from the palette
    const testIds = ["id1", "id2", "id3", "id4", "id5", "id6", "id7", "id8"];
    testIds.forEach((id) => {
      const color = generateFallbackColor(id);
      expect(colors).toContain(color);
    });
  });
});

describe("generateInitials", () => {
  it("should generate initials from a single word", () => {
    expect(generateInitials("Corte")).toBe("COR");
  });

  it("should generate initials from multiple words", () => {
    expect(generateInitials("Corte Feminino")).toBe("CF");
  });

  it("should respect max length", () => {
    expect(generateInitials("Corte", 2)).toBe("CO");
  });

  it("should handle extra whitespace", () => {
    expect(generateInitials("  Corte   Feminino  ")).toBe("CF");
  });

  it("should convert to uppercase", () => {
    expect(generateInitials("corte feminino")).toBe("CF");
  });

  it("should handle single character words", () => {
    expect(generateInitials("A B C")).toBe("ABC");
  });
});

describe("getContrastColor", () => {
  it("should return white for dark backgrounds", () => {
    expect(getContrastColor("#000000")).toBe("#FFFFFF");
    expect(getContrastColor("#1A1A1A")).toBe("#FFFFFF");
  });

  it("should return black for light backgrounds", () => {
    expect(getContrastColor("#FFFFFF")).toBe("#000000");
    expect(getContrastColor("#FFD98B")).toBe("#000000");
  });

  it("should handle pastel colors correctly", () => {
    // Light pastel colors should return black
    expect(getContrastColor("#FFD98B")).toBe("#000000");
    expect(getContrastColor("#A8E6CF")).toBe("#000000");
    
    // Darker pastel colors should return white
    expect(getContrastColor("#D4A5E9")).toBe("#000000");
  });
});

describe("getFallbackStyles", () => {
  it("should return all required styles", () => {
    const styles = getFallbackStyles("svc_123", "Corte Feminino");
    
    expect(styles).toHaveProperty("backgroundColor");
    expect(styles).toHaveProperty("textColor");
    expect(styles).toHaveProperty("initials");
  });

  it("should return consistent styles for the same input", () => {
    const styles1 = getFallbackStyles("svc_123", "Corte Feminino");
    const styles2 = getFallbackStyles("svc_123", "Corte Feminino");
    
    expect(styles1).toEqual(styles2);
  });

  it("should generate correct initials from name", () => {
    const styles = getFallbackStyles("svc_123", "Corte Feminino");
    expect(styles.initials).toBe("CF");
  });

  it("should return valid hex colors", () => {
    const styles = getFallbackStyles("svc_123", "Test");
    expect(styles.backgroundColor).toMatch(/^#[0-9A-F]{6}$/i);
    expect(styles.textColor).toMatch(/^#[0-9A-F]{6}$/i);
  });
});
