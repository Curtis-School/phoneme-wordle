import { PhonemeTile } from "@/components/phoneme/PhonemeTile";
import type { GuessState } from "@/lib/wordle";

export type GuessTile = {
  symbol: string;
  reveal?: string;
  state: GuessState;
};

type ActiveTile = {
  symbol: string;
  reveal?: string;
};

type WordleBoardProps = {
  length: number;
  rows: number;
  guesses?: GuessTile[][];
  current?: readonly ActiveTile[];
};

export function WordleBoard({
  length,
  rows,
  guesses = [],
  current = [],
}: WordleBoardProps) {
  const showActive = guesses.length < rows;
  const emptyRows = Math.max(0, rows - guesses.length - (showActive ? 1 : 0));

  return (
    <div
      role="grid"
      aria-label="Wordle board"
      className="inline-flex flex-col gap-1.5"
    >
      {guesses.map((guess, rowIndex) => (
        <div role="row" key={`guess-${rowIndex}`} className="flex gap-1.5">
          {guess.map((tile, colIndex) => (
            <PhonemeTile
              key={colIndex}
              label={tile.symbol}
              reveal={tile.reveal}
              tone={tile.state}
              size="lg"
            />
          ))}
        </div>
      ))}

      {showActive && (
        <div role="row" className="flex gap-1.5">
          {Array.from({ length }).map((_, colIndex) => {
            const tile = current[colIndex];
            return (
              <PhonemeTile
                key={colIndex}
                label={tile?.symbol}
                reveal={tile?.reveal}
                tone="default"
                size="lg"
              />
            );
          })}
        </div>
      )}

      {Array.from({ length: emptyRows }).map((_, rowIndex) => (
        <div role="row" key={`empty-${rowIndex}`} className="flex gap-1.5">
          {Array.from({ length }).map((_, colIndex) => (
            <PhonemeTile key={colIndex} tone="default" size="lg" />
          ))}
        </div>
      ))}
    </div>
  );
}
