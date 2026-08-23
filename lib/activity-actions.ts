"use server";

import { revalidatePath } from "next/cache";
import {
  ApiClientError,
  createActivity,
  deleteActivity,
  getActivities,
  getPhonemes,
} from "@/lib/api/client";
import { buildKeyboard, guessesFor } from "@/lib/wordle";
import type { ActivitySettings, Difficulty, Phoneme, WordleConfig } from "@/lib/types";

export type SaveConfigurationInput = {
  englishWord: string;
  difficulty: Difficulty;
  wordListId: number;
  wordLength: number;
  wordId: number;
  settings: ActivitySettings;
};

export type SaveConfigurationResult = { ok: true } | { ok: false; message: string };

export async function saveWordleConfiguration(
  input: SaveConfigurationInput,
): Promise<SaveConfigurationResult> {
  try {
    await createActivity({
      type: "wordle",
      name: input.englishWord,
      difficulty: input.difficulty,
      wordListId: input.wordListId,
      maxGuesses: guessesFor(input.difficulty),
      wordLength: input.wordLength,
      wordId: input.wordId,
      symbolDisplay: input.settings.symbolDisplay,
      showTooltips: input.settings.showTooltips,
      theme: input.settings.theme,
    });
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof ApiClientError ? error.message : "Could not save the activity.",
    };
  }

  revalidatePath("/wordle");

  return { ok: true };
}

export type SavedWordlePreview = {
  id: number;
  name: string;
  difficulty: Difficulty;
  config: WordleConfig;
  keys: Phoneme[];
  settings: ActivitySettings;
};

export type SavedWordleActivitiesResult =
  | { ok: true; data: SavedWordlePreview[] }
  | { ok: false; message: string };

export async function getSavedWordleActivities(): Promise<SavedWordleActivitiesResult> {
  try {
    const [activities, inventory] = await Promise.all([
      getActivities("wordle"),
      getPhonemes(),
    ]);

    const previews: SavedWordlePreview[] = [];

    for (const activity of activities) {
      if (activity.type !== "wordle" || !activity.word) continue;

      const config: WordleConfig = {
        englishWord: activity.word.english,
        word: activity.word.phonemes,
        maxGuesses: guessesFor(activity.difficulty),
        difficulty: activity.difficulty,
      };

      previews.push({
        id: activity.id,
        name: activity.name,
        difficulty: activity.difficulty,
        config,
        keys: buildKeyboard(config.word, inventory),
        settings: {
          symbolDisplay: activity.symbolDisplay,
          showTooltips: activity.showTooltips,
          theme: activity.theme,
        },
      });
    }

    return { ok: true, data: previews };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof ApiClientError ? error.message : "Could not load saved activities.",
    };
  }
}

export type DeleteActivityResult = { ok: true } | { ok: false; message: string };

export async function deleteWordleActivity(id: number): Promise<DeleteActivityResult> {
  try {
    await deleteActivity(id);
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof ApiClientError ? error.message : "Could not delete the activity.",
    };
  }

  revalidatePath("/wordle");

  return { ok: true };
}
