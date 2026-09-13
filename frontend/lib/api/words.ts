import "server-only";

import { ApiClientError, createWord, listWords, toPhoneme } from "./client";
import { MAX_WORD_SOUNDS } from "@/lib/wordle";
import type { PhonemeWord } from "@/lib/types";
import type { ApiWord } from "./types";

export type WordSaveOutcome =
  | { kind: "created"; word: ApiWord }
  | { kind: "reused"; word: ApiWord }
  | { kind: "error"; message: string };

/**
 * Puts a spelling in the dictionary, or hands back the word already stored under it. A
 * duplicate is reused rather than refused; the caller decides whether the sounds already
 * on record suit the activity asking for them.
 */
export async function createOrReuseWord(
  english: string,
  phonemes: string[],
  fallbackMessage: string,
): Promise<WordSaveOutcome> {
  try {
    return { kind: "created", word: await createWord({ english, phonemes }) };
  } catch (error) {
    if (!(error instanceof ApiClientError)) {
      return { kind: "error", message: fallbackMessage };
    }

    if (error.code !== "CONFLICT") {
      return { kind: "error", message: error.message };
    }

    const existing = (await listWords({ search: english })).find(
      (word) => word.english === english,
    );

    return existing
      ? { kind: "reused", word: existing }
      : { kind: "error", message: error.message };
  }
}

export function toPhonemeWord(word: ApiWord): PhonemeWord {
  return { english: word.english, phonemes: word.phonemes.map(toPhoneme) };
}

/**
 * The words a grid can actually show. A word longer than the grid was built for would be
 * dropped on placement, leaving an unfindable clue, so it never reaches the puzzle.
 */
export function playableWords(words: readonly ApiWord[], limit: number): PhonemeWord[] {
  return words
    .filter((word) => word.phonemes.length <= MAX_WORD_SOUNDS)
    .slice(0, limit)
    .map(toPhonemeWord);
}
