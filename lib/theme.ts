import type { Theme } from "@/lib/types";

export const THEME_COOKIE = "theme";

export const THEMES: readonly Theme[] = ["light", "dark"] as const;

export const DEFAULT_THEME: Theme = "light";

export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isTheme(value: unknown): value is Theme {
  return typeof value === "string" && THEMES.includes(value as Theme);
}

export function normalizeTheme(value: unknown): Theme {
  return isTheme(value) ? value : DEFAULT_THEME;
}

export function oppositeTheme(theme: Theme): Theme {
  return theme === "dark" ? "light" : "dark";
}
