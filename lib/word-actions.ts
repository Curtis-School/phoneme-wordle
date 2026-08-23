"use server";

import { revalidatePath } from "next/cache";
import {
  ApiClientError,
  createWord,
  deleteWord,
  getWordList,
  listWords,
  setWordListWords,
} from "@/lib/api/client";

export type SaveWordResult = { ok: true; english: string } | { ok: false; message: string };

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
}): Promise<SaveWordResult> {
  const english = input.english.trim().toLowerCase();

  if (!english) return { ok: false, message: "Type the word first." };

  if (input.phonemes.length !== input.expectedLength) {
    return {
      ok: false,
      message: `This difficulty needs exactly ${input.expectedLength} sounds.`,
    };
  }

  try {
    await createWord({ english, phonemes: input.phonemes });
  } catch (error) {
    // Already in the database: reuse it rather than refusing, but only if the stored
    // sounds are the length this activity needs.
    if (error instanceof ApiClientError && error.code === "CONFLICT") {
      const existing = (await listWords({ search: english })).find(
        (word) => word.english === english,
      );

      if (!existing) return { ok: false, message: error.message };

      if (existing.phonemes.length !== input.expectedLength) {
        return {
          ok: false,
          message: `“${english}” is already saved with ${existing.phonemes.length} sounds, so it cannot be used here.`,
        };
      }
    } else {
      return {
        ok: false,
        message:
          error instanceof ApiClientError
            ? error.message
            : "Could not save the word. Please try again.",
      };
    }
  }

  try {
    await ensureInList(input.wordListId, english);
    revalidatePath("/wordle");

    return { ok: true, english };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof ApiClientError
          ? error.message
          : "The word was saved but could not be added to this difficulty.",
    };
  }
}

export type DeleteWordResult = { ok: true } | { ok: false; message: string };

export async function deleteWordById(wordId: number): Promise<DeleteWordResult> {
  try {
    await deleteWord(wordId);
  } catch (error) {
    return {
      ok: false,
      message: error instanceof ApiClientError ? error.message : "Could not delete the word.",
    };
  }

  revalidatePath("/wordle");

  return { ok: true };
}
