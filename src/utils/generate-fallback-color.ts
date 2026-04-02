// Pastel color palette for image fallbacks (from Design Spec)
const FALLBACK_COLORS = [
  "#FFB38F", // Pastel Orange
  "#FFD98B", // Pastel Yellow
  "#A8E6CF", // Pastel Green
  "#AED9E9", // Pastel Blue
  "#D4A5E9", // Pastel Purple
  "#FFB3D9", // Pastel Pink
  "#C9D4D9", // Pastel Gray
  "#FF9B8F", // Pastel Coral
];

/**
 * Generate a consistent color from a service ID hash
 * Uses the same algorithm as specified in the Design Spec
 */
export function generateFallbackColor(id: string): string {
  const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return FALLBACK_COLORS[hash % FALLBACK_COLORS.length];
}

/**
 * Generate initials from service name (2-3 letters)
 */
export function generateInitials(name: string, maxLength: number = 3): string {
  const words = name.trim().split(/\s+/);
  
  if (words.length === 1) {
    // Single word: take first 2-3 characters
    return words[0].slice(0, maxLength).toUpperCase();
  }
  
  // Multiple words: take first letter of each word, up to maxLength
  const initials = words.map((word) => word[0]).join("");
  return initials.slice(0, maxLength).toUpperCase();
}

/**
 * Determine if text should be black or white based on background brightness
 * Uses WCAG contrast ratio calculation
 */
export function getContrastColor(backgroundColor: string): "#000000" | "#FFFFFF" {
  // Convert hex to RGB
  const hex = backgroundColor.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  
  // Calculate relative luminance (WCAG formula)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black for light backgrounds, white for dark backgrounds
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}

/**
 * Get all fallback styles for a service
 */
export function getFallbackStyles(id: string, name: string) {
  const backgroundColor = generateFallbackColor(id);
  const textColor = getContrastColor(backgroundColor);
  const initials = generateInitials(name);
  
  return {
    backgroundColor,
    textColor,
    initials,
  };
}
