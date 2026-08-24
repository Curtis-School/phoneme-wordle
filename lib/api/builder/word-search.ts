import "server-only";

import type { Phoneme, PhonemeWord } from "@/lib/types";
import { MAX_WORD_SOUNDS } from "@/lib/wordle";
import { MAX_WORD_SEARCH_WORDS, WORD_SEARCH_SIZE } from "@/lib/wordsearch";
import { getPhonemes, getWordList, listWordLists, toPhoneme } from "../client";
import type { ApiWordListSummary } from "../types";
import { describe, first, type Loaded } from "./shared";

export type WordSearchParams = { phoneme?: string };

/** One entry per phoneme in the inventory; `wordCount` is 0 when it has no words yet. */
export type SoundOption = { phoneme: Phoneme; wordCount: number };

export type LoadedWordSearch = {
  inventory: Phoneme[];
  phoneme: Phoneme;
  words: PhonemeWord[];
  wordListId: number | null;
  wordListName: string | null;
  size: number;
  seed: number;
  options: SoundOption[];
};

export function parsePhonemeParam(value: string | string[] | undefined): string | undefined {
  return first(value)?.trim() || undefined;
}

/**
 * The one place that decides which of a sound's lists is its default. Today the API orders
 * by name, so the first is stable; a saved activity or an isDefault flag replaces this.
 */
function defaultWordListFor(
  ipa: string,
  lists: ApiWordListSummary[],
): ApiWordListSummary | undefined {
  return lists.find((list) => list.targetPhoneme?.ipa === ipa);
}

/** A sound always opens as the same grid; the shuffle button moves off it from there. */
function seedFor(ipa: string): number {
  let hash = 0;

  for (const character of ipa) {
    hash = (Math.imul(hash, 31) + character.codePointAt(0)!) | 0;
  }

  return Math.abs(hash) || 1;
}

function countsByPhoneme(lists: ApiWordListSummary[]): Map<string, number> {
  const counts = new Map<string, number>();

  for (const list of lists) {
    const ipa = list.targetPhoneme?.ipa;

    // Only the default list counts — it is the one a sound resolves to.
    if (ipa && !counts.has(ipa)) counts.set(ipa, list.wordCount);
  }

  return counts;
}

export async function loadWordSearch(
  params: WordSearchParams = {},
): Promise<Loaded<LoadedWordSearch>> {
  try {
    const [inventory, lists] = await Promise.all([getPhonemes(), listWordLists()]);

    if (inventory.length === 0) {
      return {
        ok: false,
        title: "The API has no phonemes",
        message: "There is no phoneme inventory to build a word search from.",
        hint: "Seed the database with `npm run db:seed` in phoneme-api.",
      };
    }

    const counts = countsByPhoneme(lists);
    const options: SoundOption[] = inventory.map((phoneme) => ({
      phoneme,
      wordCount: counts.get(phoneme.ipa) ?? 0,
    }));

    // Without a chosen sound, open on the richest list so the first visit is playable.
    const requested = params.phoneme
      ? inventory.find((phoneme) => phoneme.ipa === params.phoneme)
      : undefined;
    const phoneme =
      requested ?? [...options].sort((a, b) => b.wordCount - a.wordCount)[0].phoneme;

    const list = defaultWordListFor(phoneme.ipa, lists);
    // An empty or missing list is a normal state, not a failure: the page offers the
    // picker and, in a later stage, a way to add words to this sound.
    const detail = list && list.wordCount > 0 ? await getWordList(list.id) : undefined;
    // A longer word than the grid was built for would be dropped on placement, leaving an
    // unfindable clue, so over-long words never reach the puzzle.
    const words: PhonemeWord[] = (detail?.words ?? [])
      .filter((word) => word.phonemes.length <= MAX_WORD_SOUNDS)
      .slice(0, MAX_WORD_SEARCH_WORDS)
      .map((word) => ({
        english: word.english,
        phonemes: word.phonemes.map(toPhoneme),
      }));

    return {
      ok: true,
      data: {
        inventory,
        phoneme,
        words,
        wordListId: list?.id ?? null,
        wordListName: list?.name ?? null,
        size: WORD_SEARCH_SIZE,
        seed: seedFor(phoneme.ipa),
        options,
      },
    };
  } catch (error) {
    return describe(error, "word_search");
  }
}
