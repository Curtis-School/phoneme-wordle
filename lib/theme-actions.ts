"use server";

import { cookies } from "next/headers";
import { THEME_COOKIE, THEME_COOKIE_MAX_AGE, normalizeTheme } from "./theme";
import type { Theme } from "./types";

export async function persistTheme(theme: Theme): Promise<void> {
  const store = await cookies();
  store.set(THEME_COOKIE, normalizeTheme(theme), {
    path: "/",
    maxAge: THEME_COOKIE_MAX_AGE,
    sameSite: "lax",
  });
}
