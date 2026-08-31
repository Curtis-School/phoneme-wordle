"use server";

import { revalidatePath } from "next/cache";
import {
  createActivity,
  deleteActivity,
  getActivities,
  getPhonemes,
} from "@/lib/api/client";
import { actionError } from "@/lib/action-result";
import { buildKeyboard, guessesFor } from "@/lib/wordle";
import type {
  ActionError,
  ActionResult,
  ActivitySettings,
  Difficulty,
  Phoneme,
  WordleConfig,
} from "@/lib/types";

type SaveConfigurationInput = {
  englishWord: string;
  difficulty: Difficulty;
  wordListId: number;
  wordLength: number;
  wordId: number;
  settings: ActivitySettings;
};

export async function saveWordleConfiguration(
  input: SaveConfigurationInput,
): Promise<ActionResult> {
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
    return actionError(error, "Could not save the activity.");
  }

  revalidatePath("/wordle");

  return { ok: true };
}

export type SavedWordlePreview = {
  id: number;
  name: string;
  difficulty: Difficulty;
  wordLength: number;
  /**
   * Null when the activity has no word pinned — either it was saved as a tier that draws a
   * fresh word every time, or the word it pinned has since been deleted. Either way there
   * is no fixed puzzle to preview or export until it is opened.
   */
  pinned: { config: WordleConfig; keys: Phoneme[] } | null;
  settings: ActivitySettings;
};

export async function getSavedWordleActivities(): Promise<
  { ok: true; data: SavedWordlePreview[] } | ActionError
> {
  try {
    const [activities, inventory] = await Promise.all([
      getActivities("wordle"),
      getPhonemes(),
    ]);

    const previews: SavedWordlePreview[] = [];

    for (const activity of activities) {
      if (activity.type !== "wordle") continue;

      const config: WordleConfig | null = activity.word && {
        englishWord: activity.word.english,
        word: activity.word.phonemes,
        maxGuesses: guessesFor(activity.difficulty),
        difficulty: activity.difficulty,
      };

      previews.push({
        id: activity.id,
        name: activity.name,
        difficulty: activity.difficulty,
        wordLength: activity.wordLength,
        pinned: config && { config, keys: buildKeyboard(config.word, inventory) },
        settings: {
          symbolDisplay: activity.symbolDisplay,
          showTooltips: activity.showTooltips,
          theme: activity.theme,
        },
      });
    }

    return { ok: true, data: previews };
  } catch (error) {
    return actionError(error, "Could not load saved activities.");
  }
}

export async function deleteWordleActivity(id: number): Promise<ActionResult> {
  try {
    await deleteActivity(id);
  } catch (error) {
    return actionError(error, "Could not delete the activity.");
  }

  revalidatePath("/wordle");

  return { ok: true };
}
