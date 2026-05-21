import * as React from "react";
import {
  DEFAULT_THEME,
  readThemeFromStorage,
  type ThemeName,
  writeThemeToStorage,
} from "@/theme/theme";

interface ThemeContextValue {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

function applyTheme(theme: ThemeName) {
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.colorScheme = theme === "dark" ? "dark" : "light";
}

function readStoredTheme() {
  if (typeof window === "undefined") return DEFAULT_THEME;
  return readThemeFromStorage(window.localStorage);
}

function writeStoredTheme(theme: ThemeName) {
  if (typeof window === "undefined") return;
  writeThemeToStorage(window.localStorage, theme);
}

export function ThemeProvider({ children }: React.PropsWithChildren) {
  const [theme, setThemeState] = React.useState<ThemeName>(readStoredTheme);

  React.useEffect(() => {
    const stored = readStoredTheme();
    setThemeState(stored);
    applyTheme(stored);
  }, []);

  const setTheme = React.useCallback((nextTheme: ThemeName) => {
    setThemeState(nextTheme);
    writeStoredTheme(nextTheme);
    applyTheme(nextTheme);
  }, []);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
