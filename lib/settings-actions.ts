"use server";

import { cookies } from "next/headers";
import {
  SETTINGS_COOKIE_MAX_AGE,
  SYMBOL_DISPLAY_COOKIE,
  THEME_COOKIE,
  TOOLTIPS_COOKIE,
  normalizeSymbolDisplay,
  normalizeTheme,
  tooltipsCookieValue,
} from "./settings";
import type { SymbolDisplay, Theme } from "./types";

const COOKIE_OPTIONS = {
  path: "/",
  maxAge: SETTINGS_COOKIE_MAX_AGE,
  sameSite: "lax" as const,
};

export async function persistTheme(theme: Theme): Promise<void> {
  const store = await cookies();
  store.set(THEME_COOKIE, normalizeTheme(theme), COOKIE_OPTIONS);
}

export async function persistSymbolDisplay(
  display: SymbolDisplay,
): Promise<void> {
  const store = await cookies();
  store.set(SYMBOL_DISPLAY_COOKIE, normalizeSymbolDisplay(display), COOKIE_OPTIONS);
}

export async function persistTooltips(show: boolean): Promise<void> {
  const store = await cookies();
  store.set(TOOLTIPS_COOKIE, tooltipsCookieValue(show), COOKIE_OPTIONS);
}
