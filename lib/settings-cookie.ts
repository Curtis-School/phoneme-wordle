import { cookies } from "next/headers";
import {
  SYMBOL_DISPLAY_COOKIE,
  THEME_COOKIE,
  TOOLTIPS_COOKIE,
  normalizeSymbolDisplay,
  normalizeTheme,
  normalizeTooltips,
} from "./settings";
import type { ActivitySettings, Theme } from "./types";

export async function getTheme(): Promise<Theme> {
  const store = await cookies();
  return normalizeTheme(store.get(THEME_COOKIE)?.value);
}

export async function getActivitySettings(): Promise<ActivitySettings> {
  const store = await cookies();
  return {
    theme: normalizeTheme(store.get(THEME_COOKIE)?.value),
    symbolDisplay: normalizeSymbolDisplay(
      store.get(SYMBOL_DISPLAY_COOKIE)?.value,
    ),
    showTooltips: normalizeTooltips(store.get(TOOLTIPS_COOKIE)?.value),
  };
}
