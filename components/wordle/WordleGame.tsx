"use client";

import { useEffect, useMemo, useState } from "react";
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
  const [message, setMessage] = useState("");

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
    setMessage("");
  }

  function backspace() {
    if (done) return;
    setCurrent((value) => value.slice(0, -1));
  }

  function submit() {
    if (done) return;
    if (current.length !== len) {
      setMessage("Fill all the sounds first.");
      return;
    }
    const next = [...guesses, current];
    setGuesses(next);
    setCurrent([]);
    if (isSolved(evaluateGuess(current, answer))) {
      setMessage("Solved!");
    } else if (next.length >= rows) {
      const revealed = answer.map((id) => byIpa[id]?.label ?? id).join(" ");
      setMessage(`Out of guesses — answer was ${revealed}.`);
    } else {
      setMessage("");
    }
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Enter") submit();
      else if (event.key === "Backspace") backspace();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  const currentTiles = current.map((ipa) => ({
    symbol: ipa,
    reveal: byIpa[ipa]?.english,
    hint: byIpa[ipa] ? phonemeHint(byIpa[ipa]) : undefined,
  }));

  const solvedRow = solved ? guesses.length - 1 : null;

  return (
    <div className="flex flex-col items-start gap-5">
      <div
        role="status"
        aria-live="polite"
        className="min-h-6 text-sm font-semibold text-foreground"
      >
        {message}
      </div>
      <WordleBoard
        length={len}
        rows={rows}
        guesses={evaluated}
        current={currentTiles}
        display={settings.symbolDisplay}
        showTooltip={settings.showTooltips}
        solvedRow={solvedRow}
      />
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
  );
}
