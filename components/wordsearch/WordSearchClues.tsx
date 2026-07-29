import {
  PhonemeStrip,
  PhonemeTile,
} from "@/components/phoneme/PhonemeTile";
import { phonemeHint } from "@/lib/phoneme";
import type { PhonemeWord, SymbolDisplay } from "@/lib/types";

type WordSearchCluesProps = {
  words: readonly PhonemeWord[];
  found?: readonly string[];
  display?: SymbolDisplay;
  showTooltip?: boolean;
};

export function WordSearchClues({
  words,
  found = [],
  display = "ipa",
  showTooltip = true,
}: WordSearchCluesProps) {
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
                  hint={phonemeHint(phoneme)}
                  display={display}
                  showTooltip={showTooltip}
                  revealed={isFound}
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
