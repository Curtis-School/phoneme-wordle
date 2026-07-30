"use client";

import { useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, ReactNode } from "react";
import type { ActivitySettings, PhonemeWord } from "@/lib/types";
import {
  lineBetween,
  matchesPlacement,
  type Cell,
  type GeneratedWordSearch,
} from "@/lib/wordsearch";
import { phonemeHint } from "@/lib/phoneme";
import { PhonemeTile } from "@/components/phoneme/PhonemeTile";
import { WordSearchClues } from "./WordSearchClues";

type WordSearchGameProps = {
  puzzle: GeneratedWordSearch;
  words: readonly PhonemeWord[];
  settings: ActivitySettings;
  onCycle?: () => void;
  takeHome?: ReactNode;
};

const ACTION_BUTTON =
  "inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-lg border border-border bg-surface px-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-muted";

const key = (cell: Cell) => `${cell.row},${cell.col}`;

function cellFromNode(node: Element | null): Cell | null {
  const target = node?.closest("[data-cell]");
  if (!target) return null;
  return {
    row: Number(target.getAttribute("data-row")),
    col: Number(target.getAttribute("data-col")),
  };
}

export function WordSearchGame({
  puzzle,
  words,
  settings,
  onCycle,
  takeHome,
}: WordSearchGameProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<Cell | null>(null);
  const selectionRef = useRef<Cell[]>([]);
  const [selection, setSelection] = useState<Cell[]>([]);
  const [found, setFound] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);

  const shownFound = useMemo(
    () => (revealed ? puzzle.words.map((placement) => placement.english) : found),
    [revealed, found, puzzle.words],
  );

  const selectedKeys = useMemo(() => new Set(selection.map(key)), [selection]);
  const foundKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const placement of puzzle.words) {
      if (shownFound.includes(placement.english)) {
        placement.cells.forEach((cell) => keys.add(key(cell)));
      }
    }
    return keys;
  }, [shownFound, puzzle.words]);

  function updateSelection(cells: Cell[]) {
    selectionRef.current = cells;
    setSelection(cells);
  }

  function handleDown(event: ReactPointerEvent<HTMLDivElement>) {
    const cell = cellFromNode(event.target as Element);
    if (!cell) return;
    startRef.current = cell;
    updateSelection([cell]);
    gridRef.current?.setPointerCapture(event.pointerId);
  }

  function handleMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!startRef.current) return;
    const cell = cellFromNode(
      document.elementFromPoint(event.clientX, event.clientY),
    );
    if (!cell) return;
    updateSelection(lineBetween(startRef.current, cell) ?? [startRef.current]);
  }

  function handleUp() {
    if (!startRef.current) return;
    const match = matchesPlacement(selectionRef.current, puzzle.words);
    if (match && !found.includes(match.english)) {
      setFound((current) => [...current, match.english]);
    }
    startRef.current = null;
    updateSelection([]);
  }

  const solved = found.length === puzzle.words.length;
  const status = revealed
    ? "Answers revealed"
    : solved
      ? "All words found!"
      : `${found.length} of ${puzzle.words.length} found`;
  const progress = Math.round((found.length / puzzle.words.length) * 100);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.85fr)]">
      <section className="flex flex-col rounded-2xl border border-border bg-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div
              role="status"
              aria-live="polite"
              className="whitespace-nowrap text-sm font-semibold text-foreground"
            >
              {status}
            </div>
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-surface-muted">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onCycle && (
              <button type="button" onClick={onCycle} className={ACTION_BUTTON}>
                <span aria-hidden="true">⤨</span>Shuffle grid
              </button>
            )}
            <button
              type="button"
              onClick={() => setRevealed((value) => !value)}
              className={
                revealed
                  ? "inline-flex h-9 items-center whitespace-nowrap rounded-lg border border-present bg-present/10 px-3.5 text-sm font-semibold text-present transition-colors"
                  : ACTION_BUTTON
              }
            >
              {revealed ? "Hide answers" : "Reveal answers"}
            </button>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center overflow-x-auto pt-4">
          <div
            ref={gridRef}
            role="grid"
            aria-label="Phoneme word search grid"
            className="grid w-fit touch-none select-none gap-1.5"
            style={{
              gridTemplateColumns: `repeat(${puzzle.size}, minmax(0, 1fr))`,
            }}
            onPointerDown={handleDown}
            onPointerMove={handleMove}
            onPointerUp={handleUp}
            onPointerCancel={handleUp}
          >
            {puzzle.grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const cellKey = `${rowIndex},${colIndex}`;
                const isFound = foundKeys.has(cellKey);
                const tone = isFound
                  ? "correct"
                  : selectedKeys.has(cellKey)
                    ? "present"
                    : "muted";
                return (
                  <div
                    key={cellKey}
                    data-cell=""
                    data-row={rowIndex}
                    data-col={colIndex}
                  >
                    <PhonemeTile
                      label={cell.ipa}
                      reveal={cell.english}
                      hint={phonemeHint(cell)}
                      display={settings.symbolDisplay}
                      showTooltip={settings.showTooltips}
                      revealed={isFound}
                      size="board"
                      tone={tone}
                    />
                  </div>
                );
              }),
            )}
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-4">
        <WordSearchClues
          words={words}
          found={shownFound}
          display={settings.symbolDisplay}
          showTooltip={settings.showTooltips}
        />
        {takeHome}
      </div>
    </div>
  );
}
