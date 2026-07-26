import {
  PhonemeStrip,
  PhonemeTile,
} from "@/components/phoneme/PhonemeTile";
import type { PhonemeWord } from "@/lib/types";

type WordSearchCluesProps = {
  words: readonly PhonemeWord[];
};

export function WordSearchClues({ words }: WordSearchCluesProps) {
  return (
    <ul className="flex flex-col gap-3">
      {words.map((word) => (
        <li
          key={word.english}
          className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface p-3"
        >
          <span className="min-w-16 text-sm font-semibold text-foreground">
            {word.english}
          </span>
          <PhonemeStrip>
            {word.phonemes.map((phoneme, index) => (
              <PhonemeTile
                key={`${word.english}-${index}`}
                label={phoneme.label}
                size="sm"
              />
            ))}
          </PhonemeStrip>
        </li>
      ))}
    </ul>
  );
}
