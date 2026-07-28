import {
  PhonemeStrip,
  PhonemeTile,
} from "@/components/phoneme/PhonemeTile";
import type { PhonemeWord } from "@/lib/types";

type WordSearchCluesProps = {
  words: readonly PhonemeWord[];
  found?: readonly string[];
};

export function WordSearchClues({ words, found = [] }: WordSearchCluesProps) {
  return (
    <ul className="flex flex-col gap-3">
      {words.map((word) => {
        const isFound = found.includes(word.english);
        return (
          <li
            key={word.english}
            className={`flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface p-3 transition-opacity ${
              isFound ? "opacity-60" : ""
            }`}
          >
            <span
              className={`min-w-16 text-sm font-semibold text-foreground ${
                isFound ? "line-through" : ""
              }`}
            >
              {word.english}
            </span>
            <PhonemeStrip>
              {word.phonemes.map((phoneme, index) => (
                <PhonemeTile
                  key={`${word.english}-${index}`}
                  label={phoneme.ipa}
                  reveal={phoneme.english}
                  size="sm"
                  tone={isFound ? "correct" : "default"}
                />
              ))}
            </PhonemeStrip>
          </li>
        );
      })}
    </ul>
  );
}
