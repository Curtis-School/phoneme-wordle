import { PhonemeTile } from "@/components/phoneme/PhonemeTile";
import type { GuessState } from "@/lib/wordle";
import type { SymbolDisplay } from "@/lib/types";

export type GuessTile = {
  symbol: string;
  reveal?: string;
  hint?: string;
  state: GuessState;
};

type ActiveTile = {
  symbol: string;
  reveal?: string;
  hint?: string;
};

type WordleBoardProps = {
  length: number;
  rows: number;
  guesses?: GuessTile[][];
  current?: readonly ActiveTile[];
  display?: SymbolDisplay;
  showTooltip?: boolean;
  solvedRow?: number | null;
};

export function WordleBoard({
  length,
  rows,
  guesses = [],
  current = [],
  display = "ipa",
  showTooltip = true,
  solvedRow = null,
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
              hint={tile.hint}
              tone={tile.state}
              display={display}
              showTooltip={showTooltip}
              revealed={solvedRow === rowIndex}
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
                hint={tile?.hint}
                tone="default"
                display={display}
                showTooltip={showTooltip}
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
