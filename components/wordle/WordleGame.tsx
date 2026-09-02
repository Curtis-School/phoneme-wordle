"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ActivitySettings, Phoneme, WordleConfig } from "@/lib/types";
import { evaluateGuess, isSolved } from "@/lib/wordle";
import { phonemeHint } from "@/lib/phoneme";
import { WordleBoard, type GuessTile } from "./WordleBoard";
import { PhonemeKeyboard } from "./PhonemeKeyboard";

type WordleGameProps = {
  config: WordleConfig;
  keys: readonly Phoneme[];
  settings: ActivitySettings;
};

export function WordleGame({ config, keys, settings }: WordleGameProps) {
  const len = config.word.length;
  const rows = config.maxGuesses;

  const answer = useMemo(
    () => config.word.map((phoneme) => phoneme.ipa),
    [config.word],
  );
  const byIpa = useMemo(() => {
    const map: Record<string, Phoneme> = {};
    for (const phoneme of [...config.word, ...keys]) {
      map[phoneme.ipa] = phoneme;
    }
    return map;
  }, [config.word, keys]);

  const [guesses, setGuesses] = useState<string[][]>([]);
  const [current, setCurrent] = useState<string[]>([]);

  const solved =
    guesses.length > 0 &&
    isSolved(evaluateGuess(guesses[guesses.length - 1], answer));
  const done = solved || guesses.length >= rows;

  const evaluated: GuessTile[][] = useMemo(
    () =>
      guesses.map((guess) => {
        const states = evaluateGuess(guess, answer);
        return guess.map((ipa, i) => ({
          symbol: ipa,
          reveal: byIpa[ipa]?.english,
          hint: byIpa[ipa] ? phonemeHint(byIpa[ipa]) : undefined,
          state: states[i],
        }));
      }),
    [guesses, answer, byIpa],
  );

  function press(ipa: string) {
    if (done || current.length >= len) return;
    setCurrent((value) => [...value, ipa]);
  }

  const backspace = useCallback(() => {
    if (done) return;
    setCurrent((value) => value.slice(0, -1));
  }, [done]);

  const submit = useCallback(() => {
    if (done || current.length !== len) return;
    setGuesses((value) => [...value, current]);
    setCurrent([]);
  }, [done, current, len]);

  function reset() {
    setGuesses([]);
    setCurrent([]);
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Enter") submit();
      else if (event.key === "Backspace") backspace();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [submit, backspace]);

  const currentTiles = current.map((ipa) => ({
    symbol: ipa,
    reveal: byIpa[ipa]?.english,
    hint: byIpa[ipa] ? phonemeHint(byIpa[ipa]) : undefined,
  }));

  const solvedRow = solved ? guesses.length - 1 : null;

  const tryLabel = done
    ? solved
      ? "Solved"
      : "Out of tries"
    : `Try ${guesses.length + 1} of ${rows}`;
  const unit = settings.symbolDisplay === "english" ? "letters" : "sounds";
  const statusText = solved
    ? `Nice — ${config.englishWord}`
    : done
      ? `The word was ${config.englishWord}`
      : current.length === len
        ? "Ready to submit"
        : `Tap ${unit} to fill the row`;
  const statusToneClass = solved
    ? "bg-correct/10 text-correct"
    : done
      ? "bg-present/10 text-present"
      : "bg-surface-muted text-muted";

  return (
    // The board and keyboard top out around 352px, so an uncapped card left a
    // wide band of empty surface on a desktop. Capped and centred in its column.
    <section className="mx-auto flex w-full max-w-lg flex-col rounded-2xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-foreground">
            {tryLabel}
          </span>
          <span
            role="status"
            aria-live="polite"
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusToneClass}`}
          >
            {statusText}
          </span>
        </div>
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-lg border border-border bg-surface px-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-muted"
        >
          <span aria-hidden="true">↺</span>New round
        </button>
      </div>

      <div className="flex justify-center py-7">
        <WordleBoard
          length={len}
          rows={rows}
          guesses={evaluated}
          current={currentTiles}
          display={settings.symbolDisplay}
          showTooltip={settings.showTooltips}
          solvedRow={solvedRow}
        />
      </div>

      <div className="flex justify-center border-t border-border pt-5">
        <PhonemeKeyboard
          keys={keys}
          onPress={press}
          onEnter={submit}
          onBackspace={backspace}
          disabled={done}
          display={settings.symbolDisplay}
          showTooltip={settings.showTooltips}
        />
      </div>
    </section>
  );
}
