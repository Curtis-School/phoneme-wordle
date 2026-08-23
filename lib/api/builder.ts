import "server-only";

import type { Difficulty, Phoneme, WordleConfig, WordSearchConfig } from "@/lib/types";
import { guessesFor } from "@/lib/wordle";
import {
  ApiClientError,
  generateActivity,
  getActivities,
  getPhonemes,
  listWords,
} from "./client";
import type {
  ActivitySummary,
  ActivityType,
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

const DIFFICULTIES: readonly Difficulty[] = ["easy", "medium", "hard"];

export type WordleActivity = Extract<ActivitySummary, { type: "wordle" }>;

export type WordleParams = { activity?: number; difficulty?: Difficulty; word?: string };

export function parseWordParam(value: string | string[] | undefined): string | undefined {
  return first(value)?.trim() || undefined;
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseActivityParam(value: string | string[] | undefined): number | undefined {
  const raw = first(value);
  const id = Number(raw);

  return raw !== undefined && Number.isInteger(id) && id > 0 ? id : undefined;
}

export function parseDifficultyParam(
  value: string | string[] | undefined,
): Difficulty | undefined {
  const raw = first(value);

  return DIFFICULTIES.find((difficulty) => difficulty === raw);
}

function isWordleActivity(activity: ActivitySummary): activity is WordleActivity {
  return activity.type === "wordle";
}

type LoadedBase = {
  activities: ActivitySummary[];
  inventory: Phoneme[];
};

export type LoadedWordle = LoadedBase & {
  config: WordleConfig;
  wordId: number;
  tiers: WordleActivity[];
  summary: WordleActivity;
  wordError?: string;
};
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

function sounds(count: number): string {
  return `${count} ${count === 1 ? "sound" : "sounds"}`;
}

// There is no reliable way to derive a word's phonemes from its spelling — English
// orthography is not phonemic, and tools like tophonetics are dictionary lookups that
// simply fail on a miss. So a typed word is looked up, never guessed.
async function resolveWord(
  spelling: string,
  wordLength: number,
): Promise<{ pinned?: { wordId: number; english: string }; wordError?: string }> {
  const needle = spelling.trim().toLowerCase();
  const matches = await listWords({ search: needle });
  const word = matches.find((match) => match.english.toLowerCase() === needle);

  if (!word) {
    return {
      wordError: `“${spelling}” is not in the phoneme dictionary, so its sounds are not known.`,
    };
  }

  if (word.phonemes.length !== wordLength) {
    return {
      wordError: `“${word.english}” has ${sounds(word.phonemes.length)}, but this difficulty needs ${sounds(wordLength)}.`,
    };
  }

  return { pinned: { wordId: word.id, english: word.english } };
}

function pickTier(
  tiers: WordleActivity[],
  difficulty: Difficulty | undefined,
): WordleActivity | undefined {
  const scoped = difficulty ? tiers.filter((tier) => tier.difficulty === difficulty) : tiers;

  return scoped.find((tier) => tier.word === null) ?? scoped[0];
}

function noTier(difficulty: Difficulty, tiers: WordleActivity[]): Loaded<never> {
  return {
    ok: false,
    title: `No ${difficulty} Wordle is saved`,
    message: `The API has no Wordle activity at ${difficulty} difficulty.`,
    hint: tiers.length
      ? `Available: ${tiers.map((tier) => tier.difficulty).join(", ")}.`
      : "Seed the database with `npm run db:seed` in phoneme-api.",
  };
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

async function generateWithFallback(
  id: number,
  pinned: { wordId: number; english: string } | undefined,
  onRejected: (message: string) => void,
) {
  if (!pinned) return generateActivity(id);

  try {
    return await generateActivity(id, { wordId: pinned.wordId });
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 400) {
      onRejected(`“${pinned.english}” is not in this difficulty’s word list.`);

      return generateActivity(id);
    }

    throw error;
  }
}

export async function loadWordle(params: WordleParams = {}): Promise<Loaded<LoadedWordle>> {
  try {
    const activities = await getActivities("wordle");
    const tiers = activities.filter(isWordleActivity).sort((a, b) => a.wordLength - b.wordLength);
    const id = params.activity ?? pickTier(tiers, params.difficulty)?.id;

    if (id === undefined) {
      return params.difficulty ? noTier(params.difficulty, tiers) : empty("wordle");
    }

    const tier = tiers.find((candidate) => candidate.id === id);
    const requested =
      params.word && tier ? await resolveWord(params.word, tier.wordLength) : {};

    let wordError = requested.wordError;
    const [generated, inventory] = await Promise.all([
      generateWithFallback(id, requested.pinned, (message) => {
        wordError = message;
      }),
      getPhonemes(),
    ]);

    if (!isWordleResponse(generated)) {
      return {
        ok: false,
        title: "That activity is not a Wordle",
        message: `"${generated.activity.name}" is a word search.`,
        hint: "Open it from the Word Search page instead.",
      };
    }

    const { activity, config, wordId } = generated;
    const summary = tiers.find((tier) => tier.id === activity.id);

    if (!summary) return empty("wordle");

    return {
      ok: true,
      data: {
        activities,
        config: { ...config, maxGuesses: guessesFor(summary.difficulty) },
        wordId,
        inventory,
        tiers,
        summary,
        wordError,
      },
    };
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

    const { config, seed } = generated;

    return { ok: true, data: { activities, config, seed, inventory } };
  } catch (error) {
    return describe(error, "word_search");
  }
}
