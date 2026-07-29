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
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
      <WordSearchGame
        key={seed}
        puzzle={puzzle}
        words={words}
        settings={settings}
        onCycle={() => setSeed((value) => value + 1)}
      />

      <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 lg:w-72">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-sm font-semibold text-foreground">
            Take-home copy
          </h2>
          <p className="text-xs text-muted">
            Download a self-contained HTML word search that plays offline. It
            matches the layout and settings shown here.
          </p>
        </div>
        <ExportButton
          phoneme={phoneme}
          words={words}
          puzzle={puzzle}
          settings={settings}
        />
      </section>
    </div>
  );
}
