"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { PhonemeStrip, PhonemeTile } from "@/components/phoneme/PhonemeTile";
import { WordBuilder } from "@/components/phoneme/WordBuilder";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { addWordToList, deleteList, removeWordFromList } from "@/lib/library-actions";
import { PencilIcon, TrashIcon } from "@/lib/icons";
import { MAX_WORD_SOUNDS } from "@/lib/wordle";
import {
  ACTION_BUTTON,
  ERROR_TEXT,
  PRIMARY_ACTION_BUTTON,
  ROW_ICON_BUTTON_DANGER,
} from "@/lib/ui";
import type { Phoneme, SymbolDisplay } from "@/lib/types";

export type EditableWord = {
  id: number;
  english: string;
  phonemes: Phoneme[];
};

type WordListEditorProps = {
  listId: number;
  words: EditableWord[];
  inventory: readonly Phoneme[];
  display: SymbolDisplay;
  activityCount: number;
  targetPhoneme: Phoneme | null;
};

export function WordListEditor({
  listId,
  words,
  inventory,
  display,
  activityCount,
  targetPhoneme,
}: WordListEditorProps) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string>();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isPending, startTransition] = useTransition();

  function remove(english: string) {
    setError(undefined);
    startTransition(async () => {
      const result = await removeWordFromList(listId, english);

      if (!result.ok) setError(result.message);
    });
  }

  function destroy() {
    setConfirmingDelete(false);
    setError(undefined);
    startTransition(async () => {
      const result = await deleteList(listId);

      if (result.ok) {
        router.push("/library");
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Words ({words.length})
        </h2>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAdding((open) => !open)}
            disabled={isPending}
            aria-expanded={adding}
            className={PRIMARY_ACTION_BUTTON}
          >
            <PencilIcon />
            {adding ? "Close" : "Add a word"}
          </button>
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            disabled={isPending || activityCount > 0}
            title={
              activityCount > 0
                ? `${activityCount} ${activityCount === 1 ? "activity uses" : "activities use"} this list, so it cannot be deleted.`
                : "Delete this word list"
            }
            className={ACTION_BUTTON}
          >
            <TrashIcon />
            Delete list
          </button>
        </div>
      </div>

      {adding ? (
        <WordBuilder
          inventory={inventory}
          requirement={
            targetPhoneme
              ? { kind: "contains", phoneme: targetPhoneme, maxSounds: MAX_WORD_SOUNDS }
              : { kind: "any", maxSounds: MAX_WORD_SOUNDS }
          }
          display={display}
          submitLabel="Add to list"
          onSubmit={async (word) => {
            const result = await addWordToList(listId, word);

            if (!result.ok) return result.message;

            setAdding(false);
          }}
          onCancel={() => setAdding(false)}
        />
      ) : null}

      {error ? (
        <p role="alert" className={ERROR_TEXT}>
          {error}
        </p>
      ) : null}

      {words.length === 0 ? (
        <p className="rounded-2xl border border-border bg-surface px-5 py-6 text-sm text-muted">
          This list holds no words yet. An activity cannot be generated from an empty
          list, so it is reported as a warning on the dashboard until you add one.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {words.map((word) => (
            <li
              key={word.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-semibold text-foreground">
                  {word.english}
                </span>
                <PhonemeStrip>
                  {word.phonemes.map((phoneme, index) => (
                    <PhonemeTile
                      key={index}
                      label={phoneme.ipa}
                      reveal={phoneme.english}
                      display={display}
                      showTooltip={false}
                      size="sm"
                    />
                  ))}
                </PhonemeStrip>
              </div>

              <button
                type="button"
                onClick={() => remove(word.english)}
                disabled={isPending}
                aria-label={`Remove ${word.english} from this list`}
                title={`Remove ${word.english} from this list`}
                className={ROW_ICON_BUTTON_DANGER}
              >
                <TrashIcon />
              </button>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete this word list"
        message="Delete this list? The words themselves stay in the dictionary and other lists keep them."
        onConfirm={destroy}
        onCancel={() => setConfirmingDelete(false)}
      />
    </div>
  );
}
