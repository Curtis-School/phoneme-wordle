"use server";

import { revalidatePath } from "next/cache";
import {
  ApiClientError,
  createWordList,
  deleteWordList,
  getWordList,
  setWordListWords,
} from "@/lib/api/client";
import { createOrReuseWord } from "@/lib/api/words";
import { actionError } from "@/lib/action-result";
import type { ActionError, ActionResult } from "@/lib/types";

function revalidateList(id: number) {
  revalidatePath("/library");
  revalidatePath(`/library/${id}`);
  revalidatePath("/dashboard");
}

export async function createList(input: {
  name: string;
  description?: string;
  targetPhoneme?: string;
}): Promise<{ ok: true; id: number } | ActionError> {
  const name = input.name.trim();

  if (!name) return { ok: false, message: "Name the word list first." };

  try {
    const list = await createWordList({
      name,
      description: input.description?.trim() || undefined,
      targetPhoneme: input.targetPhoneme || undefined,
    });

    revalidatePath("/library");
    revalidatePath("/dashboard");

    return { ok: true, id: list.id };
  } catch (error) {
    if (error instanceof ApiClientError && error.code === "CONFLICT") {
      return { ok: false, message: `A word list called “${name}” already exists.` };
    }

    return actionError(error, "Could not create the word list.");
  }
}

/** A word already in the dictionary keeps its stored sounds; other lists depend on them. */
export async function addWordToList(
  listId: number,
  input: { english: string; phonemes: string[] },
): Promise<ActionResult> {
  const english = input.english.trim().toLowerCase();

  if (!english) return { ok: false, message: "Type the word first." };

  const outcome = await createOrReuseWord(
    english,
    input.phonemes,
    "Could not save the word.",
  );

  if (outcome.kind === "error") return { ok: false, message: outcome.message };

  try {
    const list = await getWordList(listId);

    if (list.words.some((word) => word.english === english)) {
      return { ok: false, message: `“${english}” is already in this list.` };
    }

    await setWordListWords(listId, [
      ...list.words.map((word) => word.english),
      english,
    ]);
  } catch (error) {
    return actionError(error, "Could not add the word to this list.");
  }

  revalidateList(listId);

  return { ok: true };
}

export async function removeWordFromList(
  listId: number,
  english: string,
): Promise<ActionResult> {
  try {
    const list = await getWordList(listId);
    const remaining = list.words
      .map((word) => word.english)
      .filter((spelling) => spelling !== english);

    if (remaining.length === list.words.length) {
      return { ok: false, message: `“${english}” is not in this list.` };
    }

    await setWordListWords(listId, remaining);
  } catch (error) {
    return actionError(error, "Could not remove the word.");
  }

  revalidateList(listId);

  return { ok: true };
}

export async function deleteList(listId: number): Promise<ActionResult> {
  try {
    await deleteWordList(listId);
  } catch (error) {
    return actionError(error, "Could not delete the word list.");
  }

  revalidatePath("/library");
  revalidatePath("/dashboard");

  return { ok: true };
}
