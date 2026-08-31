import "server-only";

import type { Difficulty, Phoneme, WordleConfig } from "@/lib/types";
import { DIFFICULTIES } from "@/lib/difficulty";
import { guessesFor } from "@/lib/wordle";
import { ApiClientError, generateActivity, getActivities, getPhonemes, listWords } from "../client";
import type { ActivitySummary, GenerateResponse, WordleGenerateResponse } from "../types";
import { describe, empty, first, type Loaded } from "./shared";

export type WordleActivity = Extract<ActivitySummary, { type: "wordle" }>;

export type WordleParams = { activity?: number; difficulty?: Difficulty; word?: string };

export type LoadedWordle = {
  activities: ActivitySummary[];
  inventory: Phoneme[];
  config: WordleConfig;
  wordId: number;
  tiers: WordleActivity[];
  summary: WordleActivity;
  wordError?: string;
};

export function parseWordParam(value: string | string[] | undefined): string | undefined {
  return first(value)?.trim() || undefined;
}

export function parseDifficultyParam(
  value: string | string[] | undefined,
): Difficulty | undefined {
  const raw = first(value);

  return DIFFICULTIES.find((difficulty) => difficulty === raw);
}

function isWordleResponse(response: GenerateResponse): response is WordleGenerateResponse {
  return response.activity.type === "wordle";
}

function isWordleActivity(activity: ActivitySummary): activity is WordleActivity {
  return activity.type === "wordle";
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
