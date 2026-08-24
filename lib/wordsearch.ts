import type { Phoneme, PhonemeWord } from "@/lib/types";

type Direction = { dr: number; dc: number };

export type WordSearchCell = {
  label: string;
  ipa: string;
  english: string;
  example: string;
};

export type Cell = { row: number; col: number };

export type PlacedWord = {
  english: string;
  cells: Cell[];
};

export type GeneratedWordSearch = {
  size: number;
  grid: WordSearchCell[][];
  words: PlacedWord[];
};

const DIRECTIONS: readonly Direction[] = [
  { dr: 0, dc: 1 },
  { dr: 1, dc: 0 },
  { dr: 1, dc: 1 },
  { dr: -1, dc: 1 },
];

function mulberry32(seed: number): () => number {
  let state = seed;
  return function () {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled<T>(items: readonly T[], rng: () => number): T[] {
  const pool = [...items];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}

function place(
  phonemes: readonly Phoneme[],
  grid: (Phoneme | null)[][],
  size: number,
  startRow: number,
  startCol: number,
  dir: Direction,
): Cell[] | null {
  const cells: Cell[] = [];
  for (let i = 0; i < phonemes.length; i++) {
    const row = startRow + dir.dr * i;
    const col = startCol + dir.dc * i;
    if (row < 0 || row >= size || col < 0 || col >= size) return null;
    const existing = grid[row][col];
    if (existing !== null && existing.ipa !== phonemes[i].ipa) return null;
    cells.push({ row, col });
  }
  return cells;
}

/**
 * Fixed, because no word can exceed MAX_WORD_SOUNDS: the grid always has room, so the
 * puzzle's difficulty comes from how many words the list holds, not from its size.
 */
export const WORD_SEARCH_SIZE = 8;

/** How many words this grid can hold before placement starts failing. */
export const MAX_WORD_SEARCH_WORDS = 8;

export function generateWordSearch(
  words: readonly PhonemeWord[],
  size: number,
  fillers: readonly Phoneme[],
  seed = 1,
): GeneratedWordSearch {
  const rng = mulberry32(seed);
  const phonemeGrid: (Phoneme | null)[][] = Array.from({ length: size }, () =>
    Array<Phoneme | null>(size).fill(null),
  );
  const placed: PlacedWord[] = [];

  const positions = Array.from({ length: size * size }, (_, i) => ({
    row: Math.floor(i / size),
    col: i % size,
  }));

  for (const word of words) {
    if (word.phonemes.length > size) continue;

    let done = false;
    for (const dir of shuffled(DIRECTIONS, rng)) {
      for (const { row, col } of shuffled(positions, rng)) {
        const cells = place(word.phonemes, phonemeGrid, size, row, col, dir);
        if (!cells) continue;
        cells.forEach((cell, i) => {
          phonemeGrid[cell.row][cell.col] = word.phonemes[i];
        });
        placed.push({ english: word.english, cells });
        done = true;
        break;
      }
      if (done) break;
    }
  }

  const fallback: Phoneme = { ipa: "·", label: "·", example: "", english: "·" };
  const grid: WordSearchCell[][] = phonemeGrid.map((row) =>
    row.map((cellPhoneme) => {
      const phoneme =
        cellPhoneme ??
        (fillers.length > 0
          ? fillers[Math.floor(rng() * fillers.length)]
          : fallback);
      return {
        label: phoneme.label,
        ipa: phoneme.ipa,
        english: phoneme.english,
        example: phoneme.example,
      };
    }),
  );

  return { size, grid, words: placed };
}

export function lineBetween(start: Cell, end: Cell): Cell[] | null {
  const dr = end.row - start.row;
  const dc = end.col - start.col;
  const stepRow = Math.abs(dr);
  const stepCol = Math.abs(dc);
  const straight = dr === 0 || dc === 0 || stepRow === stepCol;
  if (!straight) return null;

  const length = Math.max(stepRow, stepCol);
  const dirRow = Math.sign(dr);
  const dirCol = Math.sign(dc);
  const cells: Cell[] = [];
  for (let i = 0; i <= length; i++) {
    cells.push({ row: start.row + dirRow * i, col: start.col + dirCol * i });
  }
  return cells;
}

function sameCells(a: readonly Cell[], b: readonly Cell[]): boolean {
  if (a.length !== b.length) return false;
  const forward = a.every(
    (cell, i) => cell.row === b[i].row && cell.col === b[i].col,
  );
  if (forward) return true;
  return a.every((cell, i) => {
    const j = b.length - 1 - i;
    return cell.row === b[j].row && cell.col === b[j].col;
  });
}

export function matchesPlacement(
  path: readonly Cell[],
  placements: readonly PlacedWord[],
): PlacedWord | null {
  for (const placement of placements) {
    if (sameCells(path, placement.cells)) return placement;
  }
  return null;
}
