import type { SymbolDisplay, Theme } from "./types";

export const THEME_COOKIE = "theme";
export const SYMBOL_DISPLAY_COOKIE = "symbol_display";
export const TOOLTIPS_COOKIE = "tooltips";

export const SETTINGS_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const THEMES: readonly Theme[] = ["light", "dark"] as const;
export const SYMBOL_DISPLAYS: readonly SymbolDisplay[] = [
  "ipa",
  "english",
] as const;

export const DEFAULT_THEME: Theme = "light";
export const DEFAULT_SYMBOL_DISPLAY: SymbolDisplay = "ipa";
export const DEFAULT_SHOW_TOOLTIPS = true;

export function isTheme(value: unknown): value is Theme {
  return typeof value === "string" && THEMES.includes(value as Theme);
}

export function normalizeTheme(value: unknown): Theme {
  return isTheme(value) ? value : DEFAULT_THEME;
}

export function isSymbolDisplay(value: unknown): value is SymbolDisplay {
  return (
    typeof value === "string" &&
    SYMBOL_DISPLAYS.includes(value as SymbolDisplay)
  );
}

export function normalizeSymbolDisplay(value: unknown): SymbolDisplay {
  return isSymbolDisplay(value) ? value : DEFAULT_SYMBOL_DISPLAY;
}

export function normalizeTooltips(value: unknown): boolean {
  if (value === "off" || value === false) return false;
  if (value === "on" || value === true) return true;
  return DEFAULT_SHOW_TOOLTIPS;
}

export function tooltipsCookieValue(show: boolean): string {
  return show ? "on" : "off";
}
