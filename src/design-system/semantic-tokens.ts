export const semanticTokens = {
  border: {
    subtle: "var(--theme-border-subtle)",
    default: "var(--theme-border-default)",
    strong: "var(--theme-border-strong)",
    accent: "var(--theme-border-accent)",
  },
  blur: {
    panel: "var(--theme-blur-panel)",
    shell: "var(--theme-blur-shell)",
    glow: "var(--theme-blur-glow)",
  },
  interaction: {
    hover: {
      liftY: "-2px",
      glassBackground: "var(--theme-surface-glass-hover)",
      glassBackgroundStrong: "var(--theme-surface-glass)",
      ghostText: "var(--theme-text-primary)",
    },
    focus: {
      border: "var(--theme-focus-border)",
      ring: "var(--theme-focus-ring)",
    },
    disabled: {
      opacity: "0.5",
      filter: "saturate(0.72)",
      cursor: "not-allowed",
    },
  },
  feedback: {
    success: {
      text: "var(--theme-success-text)",
      background: "var(--theme-success-bg)",
      border: "var(--theme-success-border)",
    },
    warning: {
      text: "var(--theme-warning-text)",
      background: "var(--theme-warning-bg)",
      border: "var(--theme-warning-border)",
    },
    danger: {
      text: "var(--theme-danger-text)",
      background: "var(--theme-danger-bg)",
      border: "var(--theme-danger-border)",
    },
    info: {
      text: "var(--theme-info-text)",
      background: "var(--theme-info-bg)",
      border: "var(--theme-info-border)",
    },
  },
  surface: {
    base: "var(--theme-background)",
    panel: "var(--theme-surface)",
    panelRaised: "var(--theme-surface-elevated)",
    glass: "var(--theme-surface-glass)",
    glassSubtle: "var(--theme-surface-glass-subtle)",
    glassHover: "var(--theme-surface-glass-hover)",
    premiumGradient:
      "linear-gradient(to bottom right, color-mix(in srgb, var(--theme-primary) 20%, var(--theme-surface) 80%), var(--theme-surface), var(--theme-background))",
  },
  overlay: {
    warmPrimary: "var(--theme-overlay-primary)",
    warmPrimarySoft: "var(--theme-overlay-primary-soft)",
    warmSecondary: "var(--theme-overlay-secondary)",
    warmSecondarySoft: "var(--theme-overlay-secondary-soft)",
    heroGlow: "var(--theme-overlay-hero)",
  },
} as const;

export type SemanticTokens = typeof semanticTokens;
