"use server";

import { revalidatePath } from "next/cache";
import { deleteWord, getWordList, setWordListWords } from "@/lib/api/client";
import { createOrReuseWord } from "@/lib/api/words";
import { actionError } from "@/lib/action-result";
import type { ActionError, ActionResult } from "@/lib/types";

async function ensureInList(wordListId: number, english: string): Promise<void> {
  const list = await getWordList(wordListId);
  const spellings = list.words.map((word) => word.english);

  if (spellings.includes(english)) return;

  await setWordListWords(wordListId, [...spellings, english]);
}

export async function saveWord(input: {
  english: string;
  phonemes: string[];
  wordListId: number;
  expectedLength: number;
}): Promise<{ ok: true; english: string } | ActionError> {
  const english = input.english.trim().toLowerCase();

  if (!english) return { ok: false, message: "Type the word first." };

  if (input.phonemes.length !== input.expectedLength) {
    return {
      ok: false,
      message: `This difficulty needs exactly ${input.expectedLength} sounds.`,
    };
  }

  const outcome = await createOrReuseWord(
    english,
    input.phonemes,
    "Could not save the word. Please try again.",
  );

  if (outcome.kind === "error") return { ok: false, message: outcome.message };

  if (
    outcome.kind === "reused" &&
    outcome.word.phonemes.length !== input.expectedLength
  ) {
    return {
      ok: false,
      message: `“${english}” is already saved with ${outcome.word.phonemes.length} sounds, so it cannot be used here.`,
    };
  }

  try {
    await ensureInList(input.wordListId, english);
  } catch (error) {
    return actionError(
      error,
      "The word was saved but could not be added to this difficulty.",
    );
  }

  revalidatePath("/wordle");

  return { ok: true, english };
}

export async function deleteWordById(wordId: number): Promise<ActionResult> {
  try {
    await deleteWord(wordId);
  } catch (error) {
    return actionError(error, "Could not delete the word.");
  }

  revalidatePath("/wordle");

  return { ok: true };
}
