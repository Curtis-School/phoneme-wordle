import "server-only";

import { ApiClientError } from "../client";
import type { ActivityType } from "../types";

export type Loaded<T> =
  | { ok: true; data: T }
  | { ok: false; title: string; message: string; hint?: string };

export function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function label(type: ActivityType): string {
  return type === "wordle" ? "Wordle" : "word search";
}

export function describe(error: unknown, type: ActivityType): Loaded<never> {
  if (error instanceof ApiClientError) {
    if (error.isUnreachable) {
      return {
        ok: false,
        title: "The activity API is not responding",
        message: error.message,
        hint: "Start it with phoneme-api, then reload this page.",
      };
    }

    if (error.code === "NOT_FOUND") {
      return {
        ok: false,
        title: "That activity no longer exists",
        message: error.message,
        hint: `Remove the ?activity= parameter to fall back to the first saved ${label(type)}.`,
      };
    }

    if (error.code === "UNSATISFIABLE") {
      return {
        ok: false,
        title: "This activity cannot be generated",
        message: error.message,
        hint: "Its word list has changed since the activity was saved. Edit the list, or pick another activity.",
      };
    }

    return { ok: false, title: "The API rejected the request", message: error.message };
  }

  return {
    ok: false,
    title: "Something went wrong",
    message: `The ${label(type)} could not be loaded.`,
  };
}

export function empty(type: ActivityType): Loaded<never> {
  return {
    ok: false,
    title: `No ${label(type)} activities are saved`,
    message: `The API has no ${label(type)} configuration to generate from.`,
    hint: "Ensure the database has been seeded, or create an activity.",
  };
}
