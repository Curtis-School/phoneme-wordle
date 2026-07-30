"use client";

import { useMemo, useState } from "react";
import type { ActivitySettings, Phoneme, PhonemeWord } from "@/lib/types";
import { generateWordSearch } from "@/lib/wordsearch";
import { WordSearchGame } from "./WordSearchGame";
import { ExportButton } from "./ExportButton";

type WordSearchActivityProps = {
  phoneme: Phoneme;
  words: readonly PhonemeWord[];
  fillers: readonly Phoneme[];
  size: number;
  initialSeed: number;
  settings: ActivitySettings;
};

export function WordSearchActivity({
  phoneme,
  words,
  fillers,
  size,
  initialSeed,
  settings,
}: WordSearchActivityProps) {
  const [seed, setSeed] = useState(initialSeed);

  const puzzle = useMemo(
    () => generateWordSearch(words, size, fillers, seed),
    [words, size, fillers, seed],
  );

  return (
    <WordSearchGame
      key={seed}
      puzzle={puzzle}
      words={words}
      settings={settings}
      onCycle={() => setSeed((value) => value + 1)}
      takeHome={
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-foreground">
            Take-home copy
          </h2>
          <p className="mt-1.5 text-xs leading-6 text-muted">
            A self-contained HTML puzzle that plays offline, matching the layout
            and settings shown here.
          </p>
          <ExportButton
            phoneme={phoneme}
            words={words}
            puzzle={puzzle}
            settings={settings}
          />
        </section>
      }
    />
  );
}
