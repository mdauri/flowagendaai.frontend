export const semanticTokens = {
  border: {
    subtle: "rgba(255, 255, 255, 0.10)",
    default: "rgba(255, 255, 255, 0.15)",
    strong: "rgba(255, 255, 255, 0.22)",
    accent: "rgba(255, 179, 107, 0.25)",
  },
  blur: {
    panel: "24px",
    shell: "40px",
    glow: "64px",
  },
  interaction: {
    hover: {
      liftY: "-2px",
      glassBackground: "rgba(255, 255, 255, 0.10)",
      glassBackgroundStrong: "rgba(255, 255, 255, 0.07)",
      ghostText: "#FFFFFF",
    },
    focus: {
      border: "rgba(255, 184, 77, 0.65)",
      ring: "0 0 0 3px rgba(255, 184, 77, 0.22)",
    },
    disabled: {
      opacity: "0.5",
      filter: "saturate(0.72)",
      cursor: "not-allowed",
    },
  },
  feedback: {
    success: {
      text: "#A7F3D0",
      background: "rgba(16, 185, 129, 0.12)",
      border: "rgba(16, 185, 129, 0.28)",
    },
    warning: {
      text: "#FCD34D",
      background: "rgba(245, 158, 11, 0.14)",
      border: "rgba(245, 158, 11, 0.32)",
    },
    danger: {
      text: "#F87171",
      background: "rgba(239, 68, 68, 0.10)",
      border: "rgba(248, 113, 113, 0.28)",
    },
    info: {
      text: "#93C5FD",
      background: "rgba(59, 130, 246, 0.12)",
      border: "rgba(96, 165, 250, 0.28)",
    },
  },
  surface: {
    base: "#0A0A0B",
    panel: "#121216",
    panelRaised: "#1A1A1D",
    glass: "rgba(255, 255, 255, 0.05)",
    glassSubtle: "rgba(255, 255, 255, 0.03)",
    glassHover: "rgba(255, 255, 255, 0.07)",
    premiumGradient: "linear-gradient(to bottom right, #19130F, #141416, #0F0F11)",
  },
  overlay: {
    warmPrimary: "rgba(255, 140, 56, 0.18)",
    warmPrimarySoft: "rgba(255, 140, 56, 0.16)",
    warmSecondary: "rgba(255, 184, 77, 0.12)",
    warmSecondarySoft: "rgba(255, 184, 77, 0.10)",
    heroGlow: "rgba(255, 138, 61, 0.20)",
  },
} as const;

export type SemanticTokens = typeof semanticTokens;
