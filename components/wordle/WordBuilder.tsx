"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { PhonemeTile } from "@/components/phoneme/PhonemeTile";
import { transcribe } from "@/lib/g2p";
import { phonemeHint } from "@/lib/phoneme";
import { saveWord } from "@/lib/word-actions";
import type { Phoneme, SymbolDisplay } from "@/lib/types";

type WordBuilderProps = {
  inventory: readonly Phoneme[];
  wordLength: number;
  wordListId: number;
  display: SymbolDisplay;
  onSaved: (english: string) => void;
  onCancel: () => void;
  onSpellingChange?: (spelling: string) => void;
};

export function WordBuilder({
  inventory,
  wordLength,
  wordListId,
  display,
  onSaved,
  onCancel,
  onSpellingChange,
}: WordBuilderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [spelling, setSpelling] = useState("");
  const [overrides, setOverrides] = useState<Record<number, Phoneme>>({});
  const [picking, setPicking] = useState<number>();
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    onSpellingChange?.(spelling);
  }, [spelling, onSpellingChange]);

  const draft = useMemo(() => transcribe(spelling, inventory), [spelling, inventory]);
  const sounds = draft.map((sound, index) => overrides[index] ?? sound.phoneme);

  const unresolved = sounds.some((phoneme) => phoneme === null);
  const ready = sounds.length === wordLength && !unresolved && spelling.trim().length > 0;

  function retype(next: string) {
    setSpelling(next);
    setOverrides({});
    setPicking(undefined);
    setError(undefined);
  }

  function choose(index: number, phoneme: Phoneme) {
    setOverrides((current) => ({ ...current, [index]: phoneme }));
    setPicking(undefined);
  }

  function save() {
    setError(undefined);
    startTransition(async () => {
      const result = await saveWord({
        english: spelling,
        phonemes: sounds.map((phoneme) => phoneme!.ipa),
        wordListId,
        expectedLength: wordLength,
      });

      if (result.ok) onSaved(result.english);
      else setError(result.message);
    });
  }

  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-surface p-3">
      <input
        ref={inputRef}
        value={spelling}
        disabled={isPending}
        onChange={(event) => retype(event.target.value)}
        placeholder={`Type a ${wordLength}-sound word`}
        className="h-9 rounded-lg border border-border bg-surface-muted px-2.5 text-sm text-foreground outline-none placeholder:text-muted focus-visible:border-primary"
      />

      {spelling.trim() ? (
        <>
          <div className="flex flex-wrap items-start gap-1.5">
            {draft.map((sound, index) => {
              const phoneme = sounds[index];
              const active = picking === index;

              return (
                <button
                  key={index}
                  type="button"
                  disabled={isPending}
                  onClick={() => setPicking(active ? undefined : index)}
                  title={phoneme ? phonemeHint(phoneme) : `“${sound.source}” is not a known spelling`}
                  className={`flex flex-col items-center gap-1 rounded-lg p-0.5 transition-colors ${
                    active ? "bg-primary/15 ring-2 ring-primary" : "hover:bg-surface-muted"
                  }`}
                >
                  {phoneme ? (
                    <PhonemeTile
                      label={phoneme.ipa}
                      reveal={phoneme.english}
                      display={display}
                      showTooltip={false}
                      size="board"
                    />
                  ) : (
                    <span className="flex size-11 items-center justify-center rounded-lg border border-present bg-present/15 text-base font-bold text-present">
                      ?
                    </span>
                  )}
                  <span className="text-[0.625rem] leading-none text-muted">{sound.source}</span>
                </button>
              );
            })}
          </div>

          <p
            className={`text-xs leading-5 ${
              ready ? "text-correct" : unresolved ? "text-present" : "text-muted"
            }`}
          >
            {unresolved
              ? "Tap the ? to choose that sound."
              : sounds.length === wordLength
                ? `${sounds.length} of ${wordLength} sounds — ready.`
                : `${sounds.length} ${sounds.length === 1 ? "sound" : "sounds"} — this difficulty needs ${wordLength}.`}
          </p>
        </>
      ) : null}

      {picking !== undefined ? (
        <div className="grid max-h-40 grid-cols-[repeat(auto-fill,minmax(3.5rem,1fr))] gap-1 overflow-y-auto rounded-lg border border-border bg-surface-muted p-1.5">
          {inventory.map((phoneme) => (
            <button
              key={phoneme.ipa}
              type="button"
              title={phonemeHint(phoneme)}
              onClick={() => choose(picking, phoneme)}
              className="flex flex-col items-center gap-0.5 rounded-md border border-border bg-surface px-1 py-1 transition-colors hover:border-primary"
            >
              <span className="text-xs font-semibold leading-none text-foreground">
                {phoneme.label}
              </span>
              <span className="text-[0.5625rem] leading-none text-muted">{phoneme.ipa}</span>
            </button>
          ))}
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="text-xs leading-5 text-present">
          {error}
        </p>
      ) : null}

      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="h-9 flex-1 rounded-lg border border-border text-sm font-semibold text-foreground transition-colors hover:bg-surface-muted disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={save}
          disabled={!ready || isPending}
          className="h-9 flex-1 rounded-lg bg-primary text-sm font-bold text-on-primary transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isPending ? "Saving…" : "Use word"}
        </button>
      </div>
    </div>
  );
}
