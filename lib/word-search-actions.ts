"use server";

import { revalidatePath } from "next/cache";
import {
  ApiClientError,
  createActivity,
  createWord,
  createWordList,
  deleteActivity,
  getActivities,
  getPhonemes,
  getWordList,
  listWords,
  setWordListWords,
  toPhoneme,
  updateActivity,
} from "@/lib/api/client";
import { MAX_WORD_SOUNDS } from "@/lib/wordle";
import {
  difficultyForWordCount,
  MAX_WORD_SEARCH_WORDS,
  WORD_SEARCH_SIZE,
} from "@/lib/wordsearch";
import type { ActivitySettings, Difficulty, Phoneme, PhonemeWord } from "@/lib/types";
import type { ApiWord } from "@/lib/api/types";

function message(error: unknown, fallback: string): string {
  return error instanceof ApiClientError ? error.message : fallback;
}

function toPhonemeWord(word: ApiWord): PhonemeWord {
  return { english: word.english, phonemes: word.phonemes.map(toPhoneme) };
}

export type AddWordResult = { ok: true; word: PhonemeWord } | { ok: false; message: string };

/**
 * Puts a word in the dictionary so the word search can use it. Membership of a list is not
 * touched — the clue list is edited as a draft and only written when the activity is saved.
 */
export async function addWordSearchWord(input: {
  english: string;
  phonemes: string[];
  targetPhoneme: string;
}): Promise<AddWordResult> {
  const english = input.english.trim().toLowerCase();

  if (!english) return { ok: false, message: "Type the word first." };

  if (!input.phonemes.includes(input.targetPhoneme)) {
    return {
      ok: false,
      message: `“${english}” does not contain ${input.targetPhoneme}, so it cannot be in this puzzle.`,
    };
  }

  if (input.phonemes.length > MAX_WORD_SOUNDS) {
    return {
      ok: false,
      message: `The grid only fits words up to ${MAX_WORD_SOUNDS} sounds.`,
    };
  }

  try {
    return { ok: true, word: toPhonemeWord(await createWord({ english, phonemes: input.phonemes })) };
  } catch (error) {
    // Already in the dictionary: reuse it, as long as the stored sounds suit this puzzle.
    if (error instanceof ApiClientError && error.code === "CONFLICT") {
      const existing = (await listWords({ search: english })).find(
        (word) => word.english === english,
      );

      if (!existing) return { ok: false, message: error.message };

      const sounds = existing.phonemes.map((phoneme) => phoneme.ipa);

      if (!sounds.includes(input.targetPhoneme)) {
        return {
          ok: false,
          message: `“${english}” is already saved as ${sounds.join(" ")}, which has no ${input.targetPhoneme}.`,
        };
      }

      if (sounds.length > MAX_WORD_SOUNDS) {
        return {
          ok: false,
          message: `“${english}” is already saved with ${sounds.length} sounds, which the grid cannot fit.`,
        };
      }

      return { ok: true, word: toPhonemeWord(existing) };
    }

    return { ok: false, message: message(error, "Could not save the word.") };
  }
}

export type SaveWordSearchInput = {
  name: string;
  targetPhoneme: string;
  words: string[];
  seed: number;
  settings: ActivitySettings;
  /** "overwrite" replaces the membership of `wordListId`; "new" builds a list of its own. */
  mode: "overwrite" | "new";
  wordListId: number | null;
  /** Set to edit that saved activity in place instead of creating another one. */
  activityId?: number | null;
};

export type SaveWordSearchResult = { ok: true } | { ok: false; message: string };

export async function saveWordSearchActivity(
  input: SaveWordSearchInput,
): Promise<SaveWordSearchResult> {
  const name = input.name.trim();

  if (!name) return { ok: false, message: "Name the activity first." };

  if (input.words.length === 0) {
    return { ok: false, message: "Add at least one word before saving." };
  }

  if (input.mode === "overwrite" && input.wordListId === null) {
    return { ok: false, message: "There is no existing list to overwrite." };
  }

  let wordListId: number;

  try {
    wordListId =
      input.mode === "overwrite"
        ? (await setWordListWords(input.wordListId!, input.words)).id
        : (
            await createWordList({
              name,
              targetPhoneme: input.targetPhoneme,
              words: input.words,
            })
          ).id;
  } catch (error) {
    if (error instanceof ApiClientError && error.code === "CONFLICT") {
      return { ok: false, message: `A word list called “${name}” already exists.` };
    }

    return { ok: false, message: message(error, "Could not save the word list.") };
  }

  const configuration = {
    name,
    difficulty: difficultyForWordCount(input.words.length),
    wordListId,
    targetPhoneme: input.targetPhoneme,
    gridSize: WORD_SEARCH_SIZE,
    wordCount: input.words.length,
    seed: input.seed,
    symbolDisplay: input.settings.symbolDisplay,
    showTooltips: input.settings.showTooltips,
    theme: input.settings.theme,
  };

  try {
    // Reopened from the saved-activities list: edit that row rather than leaving a second
    // activity behind under the same name.
    if (input.activityId != null) {
      await updateActivity(input.activityId, configuration);
    } else {
      await createActivity({ type: "word_search", ...configuration });
    }
  } catch (error) {
    return { ok: false, message: message(error, "Could not save the activity.") };
  }

  revalidatePath("/word-search");

  return { ok: true };
}

export type SavedWordSearchPreview = {
  id: number;
  name: string;
  difficulty: Difficulty;
  phoneme: Phoneme;
  words: PhonemeWord[];
  seed: number;
  settings: ActivitySettings;
};

export type SavedWordSearchActivitiesResult =
  | { ok: true; data: SavedWordSearchPreview[]; inventory: Phoneme[] }
  | { ok: false; message: string };

export async function getSavedWordSearchActivities(): Promise<SavedWordSearchActivitiesResult> {
  try {
    const [activities, inventory] = await Promise.all([
      getActivities("word_search"),
      getPhonemes(),
    ]);

    const saved = activities.filter((activity) => activity.type === "word_search");
    const lists = await Promise.all(
      saved.map((activity) => getWordList(activity.wordList.id)),
    );

    const data = saved.map((activity, index) => ({
      id: activity.id,
      name: activity.name,
      difficulty: activity.difficulty,
      phoneme: toPhoneme(activity.targetPhoneme),
      words: lists[index].words
        .filter((word) => word.phonemes.length <= MAX_WORD_SOUNDS)
        .slice(0, Math.min(activity.wordCount, MAX_WORD_SEARCH_WORDS))
        .map(toPhonemeWord),
      seed: activity.seed ?? 1,
      settings: {
        symbolDisplay: activity.symbolDisplay,
        showTooltips: activity.showTooltips,
        theme: activity.theme,
      },
    }));

    return { ok: true, data, inventory };
  } catch (error) {
    return { ok: false, message: message(error, "Could not load saved activities.") };
  }
}

export type DeleteWordSearchResult = { ok: true } | { ok: false; message: string };

export async function deleteWordSearchActivity(id: number): Promise<DeleteWordSearchResult> {
  try {
    await deleteActivity(id);
  } catch (error) {
    return { ok: false, message: message(error, "Could not delete the activity.") };
  }

  revalidatePath("/word-search");

  return { ok: true };
}
