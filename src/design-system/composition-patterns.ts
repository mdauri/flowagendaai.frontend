import { semanticTokens } from "./semantic-tokens";

export const compositionPatterns = {
  overlay: {
    marketingPage: [
      `radial-gradient(circle at top, ${semanticTokens.overlay.warmPrimary}, transparent 35%)`,
      `radial-gradient(circle at 80% 20%, ${semanticTokens.overlay.warmSecondary}, transparent 30%)`,
      "linear-gradient(to bottom, #0A0A0B, #0D0D10, #111114)",
    ].join(", "),
    legalPage: [
      `radial-gradient(circle at top, ${semanticTokens.overlay.warmPrimarySoft}, transparent 32%)`,
      `radial-gradient(circle at 82% 14%, ${semanticTokens.overlay.warmSecondarySoft}, transparent 26%)`,
      "linear-gradient(to bottom, #0A0A0B, #0D0D10, #111114)",
    ].join(", "),
  },
} as const;

