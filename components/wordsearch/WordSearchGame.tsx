"use client";

import { useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { PhonemeWord } from "@/lib/types";
import {
  lineBetween,
  matchesPlacement,
  type Cell,
  type GeneratedWordSearch,
} from "@/lib/wordsearch";
import { PhonemeTile } from "@/components/phoneme/PhonemeTile";
import { WordSearchClues } from "./WordSearchClues";

type WordSearchGameProps = {
  puzzle: GeneratedWordSearch;
  words: readonly PhonemeWord[];
};

const key = (cell: Cell) => `${cell.row},${cell.col}`;

function cellFromNode(node: Element | null): Cell | null {
  const target = node?.closest("[data-cell]");
  if (!target) return null;
  return {
    row: Number(target.getAttribute("data-row")),
    col: Number(target.getAttribute("data-col")),
  };
}

export function WordSearchGame({ puzzle, words }: WordSearchGameProps) {
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

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <div
            role="status"
            aria-live="polite"
            className="text-sm font-semibold text-foreground"
          >
            {status}
          </div>
          <button
            type="button"
            onClick={() => setRevealed((value) => !value)}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface-muted"
          >
            {revealed ? "Hide answers" : "Reveal answers"}
          </button>
        </div>

        <div className="overflow-x-auto">
          <div
            ref={gridRef}
            role="grid"
            aria-label="Phoneme word search grid"
            className="grid w-fit touch-none select-none gap-1"
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
                const tone = foundKeys.has(cellKey)
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
                      size="sm"
                      tone={tone}
                    />
                  </div>
                );
              }),
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:min-w-72">
        <h2 className="text-sm font-semibold text-foreground">Words to find</h2>
        <WordSearchClues words={words} found={shownFound} />
      </div>
    </div>
  );
}
