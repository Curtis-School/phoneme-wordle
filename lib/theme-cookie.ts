import { cookies } from "next/headers";
import { THEME_COOKIE, normalizeTheme } from "./theme";
import type { Theme } from "./types";

export async function getTheme(): Promise<Theme> {
  const store = await cookies();
  return normalizeTheme(store.get(THEME_COOKIE)?.value);
}
