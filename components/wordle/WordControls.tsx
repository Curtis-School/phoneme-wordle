"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { WordBuilder } from "@/components/phoneme/WordBuilder";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { deleteWordById, saveWord } from "@/lib/word-actions";
import { PencilIcon, ReloadIcon, TrashIcon } from "@/lib/icons";
import { ERROR_TEXT, ICON_BUTTON, ICON_BUTTON_ACTIVE, ICON_BUTTON_DANGER } from "@/lib/ui";
import type { Difficulty, Phoneme, SymbolDisplay } from "@/lib/types";

type WordControlsProps = {
  englishWord: string;
  wordId: number;
  difficulty: Difficulty;
  wordLength: number;
  wordListId: number;
  inventory: readonly Phoneme[];
  display: SymbolDisplay;
  error?: string;
};

export function WordControls({
  englishWord,
  wordId,
  difficulty,
  wordLength,
  wordListId,
  inventory,
  display,
  error,
}: WordControlsProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(Boolean(error));
  const [isPending, startTransition] = useTransition();
  const [dismissedError, setDismissedError] = useState<string>();
  const [deleteError, setDeleteError] = useState<string>();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const visibleError = deleteError ?? (error === dismissedError ? undefined : error);

  function show(word: string) {
    setEditing(false);
    startTransition(() => {
      router.replace(`/wordle?difficulty=${difficulty}&word=${encodeURIComponent(word)}`);
      router.refresh();
    });
  }

  function draw() {
    setEditing(false);
    startTransition(() => {
      router.replace(`/wordle?difficulty=${difficulty}`);
      router.refresh();
    });
  }

  function remove() {
    setConfirmingDelete(false);
    setDeleteError(undefined);
    startTransition(async () => {
      const result = await deleteWordById(wordId);

      if (result.ok) {
        router.replace(`/wordle?difficulty=${difficulty}`);
        router.refresh();
      } else {
        setDeleteError(result.message);
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-base font-semibold text-foreground">{englishWord}</span>
        <button
          type="button"
          onClick={draw}
          disabled={isPending}
          aria-label="Draw a different word"
          title="Draw a different word"
          className={ICON_BUTTON}
        >
          <ReloadIcon />
        </button>
        <button
          type="button"
          onClick={() => setEditing((open) => !open)}
          aria-label="Choose a word"
          aria-expanded={editing}
          title="Choose a word"
          className={editing ? ICON_BUTTON_ACTIVE : ICON_BUTTON}
        >
          <PencilIcon />
        </button>
        <button
          type="button"
          onClick={() => setConfirmingDelete(true)}
          disabled={isPending}
          aria-label="Delete this word"
          title="Delete this word"
          className={ICON_BUTTON_DANGER}
        >
          <TrashIcon />
        </button>
      </div>

      {editing ? (
        <WordBuilder
          inventory={inventory}
          requirement={{ kind: "length", wordLength }}
          display={display}
          submitLabel="Use word"
          onSubmit={async ({ english, phonemes }) => {
            const result = await saveWord({
              english,
              phonemes,
              wordListId,
              expectedLength: wordLength,
            });

            if (!result.ok) return result.message;

            show(result.english);
          }}
          onCancel={() => setEditing(false)}
          onSpellingChange={(spelling) => {
            if (!spelling.trim()) setDismissedError(error);
          }}
        />
      ) : null}

      {visibleError ? (
        <p role="alert" className={ERROR_TEXT}>
          {visibleError} Try another word, or use the reload icon for a random one.
        </p>
      ) : null}

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete this word"
        message={`Delete “${englishWord}” from the dictionary? This removes it from every word list.`}
        onConfirm={remove}
        onCancel={() => setConfirmingDelete(false)}
      />
    </div>
  );
}
