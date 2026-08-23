import "server-only";

import type { Phoneme, WordleConfig, WordSearchConfig } from "@/lib/types";
import { ApiClientError, generateActivity, getActivities, getPhonemes } from "./client";
import type {
  ActivitySummary,
  ActivityType,
  GeneratedActivity,
  GenerateResponse,
  WordleGenerateResponse,
  WordSearchGenerateResponse,
} from "./types";

function isWordleResponse(response: GenerateResponse): response is WordleGenerateResponse {
  return response.activity.type === "wordle";
}

function isWordSearchResponse(
  response: GenerateResponse,
): response is WordSearchGenerateResponse {
  return response.activity.type === "word_search";
}

export function parseActivityParam(value: string | string[] | undefined): number | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  const id = Number(raw);

  return raw !== undefined && Number.isInteger(id) && id > 0 ? id : undefined;
}

type LoadedBase = {
  activities: ActivitySummary[];
  activity: GeneratedActivity;
  inventory: Phoneme[];
};

export type LoadedWordle = LoadedBase & { config: WordleConfig; wordId: number };
export type LoadedWordSearch = LoadedBase & { config: WordSearchConfig; seed: number };

export type Loaded<T> =
  | { ok: true; data: T }
  | { ok: false; title: string; message: string; hint?: string };

function describe(error: unknown, type: ActivityType): Loaded<never> {
  const label = type === "wordle" ? "Wordle" : "word search";

  if (error instanceof ApiClientError) {
    if (error.isUnreachable) {
      return {
        ok: false,
        title: "The activity API is not responding",
        message: error.message,
        hint: "Start it with `npm run dev` (or `docker compose up`) in phoneme-api, then reload this page.",
      };
    }

    if (error.code === "NOT_FOUND") {
      return {
        ok: false,
        title: "That activity no longer exists",
        message: error.message,
        hint: `Remove the ?activity= parameter to fall back to the first saved ${label}.`,
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
    message: `The ${label} could not be loaded.`,
  };
}

function select(activities: ActivitySummary[], requested: number | undefined): number | undefined {
  if (requested !== undefined) return requested;

  return activities[0]?.id;
}

function empty(type: ActivityType): Loaded<never> {
  const label = type === "wordle" ? "Wordle" : "word search";

  return {
    ok: false,
    title: `No ${label} activities are saved`,
    message: `The API has no ${label} configuration to generate from.`,
    hint: "Seed the database with `npm run db:seed` in phoneme-api, or create an activity there.",
  };
}

export async function loadWordle(requested?: number): Promise<Loaded<LoadedWordle>> {
  try {
    const activities = await getActivities("wordle");
    const id = select(activities, requested);

    if (id === undefined) return empty("wordle");
    
    const [generated, inventory] = await Promise.all([generateActivity(id), getPhonemes()]);

    if (!isWordleResponse(generated)) {
      return {
        ok: false,
        title: "That activity is not a Wordle",
        message: `"${generated.activity.name}" is a word search.`,
        hint: "Open it from the Word Search page instead.",
      };
    }

    const { activity, config, wordId } = generated;

    return { ok: true, data: { activities, activity, config, wordId, inventory } };
  } catch (error) {
    return describe(error, "wordle");
  }
}

export async function loadWordSearch(requested?: number): Promise<Loaded<LoadedWordSearch>> {
  try {
    const activities = await getActivities("word_search");
    const id = select(activities, requested);

    if (id === undefined) return empty("word_search");

    const [generated, inventory] = await Promise.all([generateActivity(id), getPhonemes()]);

    if (!isWordSearchResponse(generated)) {
      return {
        ok: false,
        title: "That activity is not a word search",
        message: `"${generated.activity.name}" is a Wordle.`,
        hint: "Open it from the Wordle page instead.",
      };
    }

    const { activity, config, seed } = generated;

    return { ok: true, data: { activities, activity, config, seed, inventory } };
  } catch (error) {
    return describe(error, "word_search");
  }
}
