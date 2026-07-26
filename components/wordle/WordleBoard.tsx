import { PhonemeTile } from "@/components/phoneme/PhonemeTile";

export type GuessState = "correct" | "present" | "absent";

export type GuessTile = {
  label: string;
  ipa?: string;
  state: GuessState;
};

type WordleBoardProps = {
  length: number;
  rows: number;
  guesses?: GuessTile[][];
};

export function WordleBoard({ length, rows, guesses = [] }: WordleBoardProps) {
  const emptyRows = Math.max(0, rows - guesses.length);

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
              label={tile.label}
              ipa={tile.ipa}
              tone={tile.state}
              size="lg"
            />
          ))}
        </div>
      ))}

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
