export const colors = {
  brand: {
    primary: "#FF8A3D",
    secondary: "#FFB84D",
    tertiary: "#FFE0A3",
  },
  background: {
    base: "#0A0A0B",
    surface: "#121216",
    surface2: "#1A1A1D",
    glass: "rgba(255, 255, 255, 0.05)",
    glassSubtle: "rgba(255, 255, 255, 0.03)",
  },
  text: {
    primary: "#FFFFFF",
    soft: "rgba(255, 255, 255, 0.72)",
    muted: "rgba(255, 255, 255, 0.55)",
    dark: "#1A1A1A",
  },
  badge: {
    background: "#2A2017",
    text: "#FFD2A1",
    border: "rgba(255, 179, 107, 0.25)",
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
} as const;
