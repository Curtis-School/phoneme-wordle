"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { WordBuilder } from "./WordBuilder";
import type { Difficulty, Phoneme, SymbolDisplay } from "@/lib/types";

type WordControlsProps = {
  englishWord: string;
  difficulty: Difficulty;
  wordLength: number;
  wordListId: number;
  inventory: readonly Phoneme[];
  display: SymbolDisplay;
  error?: string;
};

export function WordControls({
  englishWord,
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
  const visibleError = error === dismissedError ? undefined : error;

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
          className="flex size-8 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-primary hover:text-foreground disabled:opacity-50"
        >
          <ReloadIcon />
        </button>
        <button
          type="button"
          onClick={() => setEditing((open) => !open)}
          aria-label="Choose a word"
          aria-expanded={editing}
          title="Choose a word"
          className={`flex size-8 items-center justify-center rounded-lg border transition-colors ${
            editing
              ? "border-primary bg-primary text-on-primary"
              : "border-border text-muted hover:border-primary hover:text-foreground"
          }`}
        >
          <PencilIcon />
        </button>
      </div>

      {editing ? (
        <WordBuilder
          inventory={inventory}
          wordLength={wordLength}
          wordListId={wordListId}
          display={display}
          onSaved={show}
          onCancel={() => setEditing(false)}
          onSpellingChange={(spelling) => {
            if (!spelling.trim()) setDismissedError(error);
          }}
        />
      ) : null}

      {visibleError ? (
        <p role="alert" className="text-xs leading-5 text-present">
          {visibleError} Try another word, or use the reload icon for a random one.
        </p>
      ) : null}
    </div>
  );
}

function ReloadIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  );
}
