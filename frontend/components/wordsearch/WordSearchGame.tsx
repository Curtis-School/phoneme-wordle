"use client";

import { useMemo, useRef, useState } from "react";
import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import type { ActivitySettings, PhonemeWord } from "@/lib/types";
import {
  lineBetween,
  matchesPlacement,
  type Cell,
  type GeneratedWordSearch,
} from "@/lib/wordsearch";
import { phonemeHint } from "@/lib/phoneme";
import { PhonemeTile } from "@/components/phoneme/PhonemeTile";
import { WordSearchClues, type WordSearchEdit } from "./WordSearchClues";
import { ACTION_BUTTON } from "@/lib/ui";

type WordSearchGameProps = {
  puzzle: GeneratedWordSearch;
  words: readonly PhonemeWord[];
  settings: ActivitySettings;
  onCycle?: () => void;
  edit?: WordSearchEdit;
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

export function WordSearchGame({
  puzzle,
  words,
  settings,
  onCycle,
  edit,
}: WordSearchGameProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<Cell | null>(null);
  const selectionRef = useRef<Cell[]>([]);
  const [selection, setSelection] = useState<Cell[]>([]);
  const [found, setFound] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  /** The cell arrow keys are on. Only this one is tabbable, so Tab crosses the grid once. */
  const [cursor, setCursor] = useState<Cell>({ row: 0, col: 0 });
  /** Where a keyboard selection started; null while no word is part-selected. */
  const [anchor, setAnchor] = useState<Cell | null>(null);
  const [announcement, setAnnouncement] = useState("");

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
    setAnchor(null);
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

  /** Scores a completed path, whether it was dragged or typed. */
  function commit(path: readonly Cell[]) {
    const match = path.length > 1 ? matchesPlacement(path, puzzle.words) : null;

    if (match) {
      if (!found.includes(match.english)) {
        setFound((current) => [...current, match.english]);
      }
      setAnnouncement(`Found ${match.english}.`);
    } else {
      setAnnouncement("Not one of the words.");
    }
  }

  function handleUp() {
    if (!startRef.current) return;
    commit(selectionRef.current);
    startRef.current = null;
    updateSelection([]);
  }

  function focusCell(cell: Cell) {
    gridRef.current
      ?.querySelector<HTMLElement>(
        `[data-row="${cell.row}"][data-col="${cell.col}"]`,
      )
      ?.focus();
  }

  function moveTo(cell: Cell) {
    setCursor(cell);
    focusCell(cell);
    // With a start cell chosen, moving previews the word being spelled out.
    if (anchor) updateSelection(lineBetween(anchor, cell) ?? [anchor]);
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLElement>, cell: Cell) {
    const last = puzzle.size - 1;
    const clamp = (value: number) => Math.max(0, Math.min(last, value));

    const moves: Record<string, Cell> = {
      ArrowUp: { row: clamp(cell.row - 1), col: cell.col },
      ArrowDown: { row: clamp(cell.row + 1), col: cell.col },
      ArrowLeft: { row: cell.row, col: clamp(cell.col - 1) },
      ArrowRight: { row: cell.row, col: clamp(cell.col + 1) },
      Home: { row: cell.row, col: 0 },
      End: { row: cell.row, col: last },
    };

    const next = moves[event.key];

    if (next) {
      event.preventDefault();
      moveTo(next);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();

      if (!anchor) {
        setAnchor(cell);
        updateSelection([cell]);
        setAnnouncement(
          `Start of word at row ${cell.row + 1}, column ${cell.col + 1}. Move to the last sound and press Enter again.`,
        );
        return;
      }

      commit(lineBetween(anchor, cell) ?? [anchor]);
      setAnchor(null);
      updateSelection([]);
      return;
    }

    if (event.key === "Escape" && anchor) {
      event.preventDefault();
      setAnchor(null);
      updateSelection([]);
      setAnnouncement("Selection cleared.");
    }
  }

  // A shuffled grid invalidates a half-finished selection. Adjusting during render
  // rather than in an effect keeps it out of a second render pass.
  const [renderedPuzzle, setRenderedPuzzle] = useState(puzzle);

  if (renderedPuzzle !== puzzle) {
    setRenderedPuzzle(puzzle);
    setAnchor(null);
    // The drag ref is rewritten on every pointer down, so clearing the state is enough.
    setSelection([]);
  }

  const solved = found.length === puzzle.words.length;
  const status = revealed
    ? "Answers revealed"
    : solved
      ? "All words found!"
      : `${found.length} of ${puzzle.words.length} found`;
  const progress = Math.round((found.length / puzzle.words.length) * 100);

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.85fr)]">
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

        <div className="pt-4">
          <div
            ref={gridRef}
            role="grid"
            aria-label="Phoneme word search grid"
            className="mx-auto grid w-full max-w-100 touch-none select-none gap-1 sm:gap-1.5"
            style={{
              gridTemplateColumns: `repeat(${puzzle.size}, minmax(0, 1fr))`,
            }}
            onPointerDown={handleDown}
            onPointerMove={handleMove}
            onPointerUp={handleUp}
            onPointerCancel={handleUp}
          >
            {puzzle.grid.map((row, rowIndex) => (
              // display:contents keeps the rows in the accessibility tree without
              // breaking the single CSS grid the cells are laid out on.
              <div key={rowIndex} role="row" className="contents">
                {row.map((cell, colIndex) => {
                  const cellKey = `${rowIndex},${colIndex}`;
                  const isFound = foundKeys.has(cellKey);
                  const isSelected = selectedKeys.has(cellKey);
                  const tone = isFound ? "correct" : isSelected ? "present" : "muted";
                  return (
                    <button
                      key={cellKey}
                      type="button"
                      role="gridcell"
                      data-cell=""
                      data-row={rowIndex}
                      data-col={colIndex}
                      tabIndex={
                        cursor.row === rowIndex && cursor.col === colIndex ? 0 : -1
                      }
                      aria-selected={isSelected}
                      aria-label={`${phonemeHint(cell)}, row ${rowIndex + 1}, column ${colIndex + 1}`}
                      onFocus={() => setCursor({ row: rowIndex, col: colIndex })}
                      onKeyDown={(event) =>
                        handleKeyDown(event, { row: rowIndex, col: colIndex })
                      }
                      className="w-full rounded-lg"
                    >
                      <PhonemeTile
                        label={cell.ipa}
                        reveal={cell.english}
                        hint={phonemeHint(cell)}
                        display={settings.symbolDisplay}
                        showTooltip={settings.showTooltips}
                        revealed={isFound}
                        size="grid"
                        tone={tone}
                      />
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <p className="mt-3 text-center text-xs text-muted">
            Drag across the grid, or use the arrow keys and press Enter on the first and
            last sound of a word.
          </p>

          <p role="status" aria-live="polite" className="sr-only">
            {announcement}
          </p>
        </div>
      </section>

      <div className="flex flex-col gap-4">
        <WordSearchClues
          words={words}
          edit={edit}
          found={shownFound}
          display={settings.symbolDisplay}
          showTooltip={settings.showTooltips}
        />
      </div>
    </div>
  );
}
