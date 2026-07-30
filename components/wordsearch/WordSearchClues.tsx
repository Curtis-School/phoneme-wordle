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
    <section className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-4.5 py-4">
        <h2 className="text-sm font-semibold text-foreground">Words to find</h2>
        <span className="text-xs font-semibold text-muted">
          {words.length} words
        </span>
      </div>
      <ul>
        {words.map((word) => {
          const isFound = found.includes(word.english);
          return (
            <li
              key={word.english}
              className={`flex items-center gap-3 border-t border-border/60 px-4.5 py-3 first:border-t-0 ${
                isFound ? "bg-surface-muted/40" : ""
              }`}
            >
              <span
                className={`text-sm font-semibold ${
                  isFound
                    ? "text-muted line-through"
                    : "text-foreground"
                }`}
              >
                {word.english}
              </span>
              <span className="ml-auto">
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
              </span>
              <span
                aria-hidden="true"
                className={`w-5 text-center text-sm font-bold text-primary ${
                  isFound ? "opacity-100" : "opacity-15"
                }`}
              >
                ✓
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
