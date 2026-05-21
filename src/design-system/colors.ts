export const colors = {
  brand: {
    primary: "var(--theme-primary)",
    secondary: "var(--theme-secondary)",
    tertiary: "var(--theme-accent)",
  },
  background: {
    base: "var(--theme-background)",
    surface: "var(--theme-surface)",
    surface2: "var(--theme-surface-elevated)",
    glass: "var(--theme-surface-glass)",
    glassSubtle: "var(--theme-surface-glass-subtle)",
  },
  text: {
    primary: "var(--theme-text-primary)",
    soft: "var(--theme-text-soft)",
    muted: "var(--theme-text-muted)",
    dark: "var(--theme-text-on-primary)",
  },
  badge: {
    background: "var(--theme-badge-background)",
    text: "var(--theme-badge-text)",
    border: "var(--theme-border-accent)",
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
} as const;
