import type { Phoneme, PhonemeWord } from "@/lib/types";

type Direction = { dr: number; dc: number };

export type WordSearchCell = {
  label: string;
  isSolution: boolean;
};

export type PlacedWord = {
  english: string;
  labels: string[];
  cells: { row: number; col: number }[];
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
  { dr: 0, dc: -1 },
  { dr: -1, dc: 0 },
  { dr: -1, dc: -1 },
  { dr: 1, dc: -1 },
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
  labels: readonly string[],
  grid: (string | null)[][],
  size: number,
  startRow: number,
  startCol: number,
  dir: Direction,
): { row: number; col: number }[] | null {
  const cells: { row: number; col: number }[] = [];
  for (let i = 0; i < labels.length; i++) {
    const row = startRow + dir.dr * i;
    const col = startCol + dir.dc * i;
    if (row < 0 || row >= size || col < 0 || col >= size) return null;
    const existing = grid[row][col];
    if (existing !== null && existing !== labels[i]) return null;
    cells.push({ row, col });
  }
  return cells;
}

export function generateWordSearch(
  words: readonly PhonemeWord[],
  size: number,
  fillers: readonly Phoneme[],
  seed = 1,
): GeneratedWordSearch {
  const rng = mulberry32(seed);
  const labelGrid: (string | null)[][] = Array.from({ length: size }, () =>
    Array<string | null>(size).fill(null),
  );
  const placed: PlacedWord[] = [];

  const positions = Array.from({ length: size * size }, (_, i) => ({
    row: Math.floor(i / size),
    col: i % size,
  }));

  for (const word of words) {
    const labels = word.phonemes.map((p) => p.label);
    if (labels.length > size) continue;

    let done = false;
    for (const dir of shuffled(DIRECTIONS, rng)) {
      for (const { row, col } of shuffled(positions, rng)) {
        const cells = place(labels, labelGrid, size, row, col, dir);
        if (!cells) continue;
        cells.forEach((cell, i) => {
          labelGrid[cell.row][cell.col] = labels[i];
        });
        placed.push({ english: word.english, labels, cells });
        done = true;
        break;
      }
      if (done) break;
    }
  }

  const fillerLabels = fillers.map((p) => p.label);
  const grid: WordSearchCell[][] = labelGrid.map((row) =>
    row.map((label) => {
      if (label !== null) return { label, isSolution: true };
      const filler =
        fillerLabels.length > 0
          ? fillerLabels[Math.floor(rng() * fillerLabels.length)]
          : "·";
      return { label: filler, isSolution: false };
    }),
  );

  return { size, grid, words: placed };
}
