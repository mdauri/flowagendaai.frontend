export const THEME_STORAGE_KEY = "agendoro-theme";

export type ThemeName = "dark" | "light-pastel";

export const DEFAULT_THEME: ThemeName = "dark";

export function isThemeName(value: string | null): value is ThemeName {
  return value === "dark" || value === "light-pastel";
}

export function resolveStoredTheme(storageValue: string | null): ThemeName {
  return isThemeName(storageValue) ? storageValue : DEFAULT_THEME;
}

export function readThemeFromStorage(storage: Storage | null | undefined): ThemeName {
  try {
    return resolveStoredTheme(storage?.getItem(THEME_STORAGE_KEY) ?? null);
  } catch {
    return DEFAULT_THEME;
  }
}

export function writeThemeToStorage(
  storage: Storage | null | undefined,
  theme: ThemeName,
) {
  try {
    storage?.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Theme selection is local-only; failing storage must not break public pages.
  }
}
