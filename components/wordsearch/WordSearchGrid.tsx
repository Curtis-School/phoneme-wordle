import { PhonemeTile } from "@/components/phoneme/PhonemeTile";
import type { GeneratedWordSearch } from "@/lib/wordsearch";

type WordSearchGridProps = {
  puzzle: GeneratedWordSearch;
  showSolution?: boolean;
};

export function WordSearchGrid({
  puzzle,
  showSolution = false,
}: WordSearchGridProps) {
  return (
    <div
      role="grid"
      aria-label="Phoneme word search grid"
      className="grid w-fit gap-1"
      style={{
        gridTemplateColumns: `repeat(${puzzle.size}, minmax(0, 1fr))`,
      }}
    >
      {puzzle.grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <PhonemeTile
            key={`${rowIndex}-${colIndex}`}
            label={cell.label}
            size="sm"
            tone={showSolution && cell.isSolution ? "correct" : "muted"}
          />
        )),
      )}
    </div>
  );
}
