"use client";

import type { Phoneme, SymbolDisplay } from "@/lib/types";
import { phonemeHint } from "@/lib/phoneme";

type PhonemeKeyboardProps = {
  keys: readonly Phoneme[];
  onPress: (ipa: string) => void;
  onEnter: () => void;
  onBackspace: () => void;
  disabled?: boolean;
  display?: SymbolDisplay;
  showTooltip?: boolean;
};

export function PhonemeKeyboard({
  keys,
  onPress,
  onEnter,
  onBackspace,
  disabled = false,
  display = "ipa",
  showTooltip = true,
}: PhonemeKeyboardProps) {
  const half = Math.ceil(keys.length / 2);
  const rows = [keys.slice(0, half), keys.slice(half)];
  const englishDefault = display === "english";

  return (
    <div className="flex flex-col items-center gap-2">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex flex-wrap justify-center gap-2">
          {row.map((phoneme) => {
            const front = englishDefault ? phoneme.english : phoneme.ipa;
            const back = englishDefault ? phoneme.ipa : phoneme.english;
            return (
              <button
                key={phoneme.ipa}
                type="button"
                disabled={disabled}
                onClick={() => onPress(phoneme.ipa)}
                title={showTooltip ? phonemeHint(phoneme) : undefined}
                className="group relative inline-flex h-12 min-w-13 items-center justify-center rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-foreground transition-colors hover:border-primary disabled:opacity-40"
              >
                <span
                  className={`transition-opacity group-hover:opacity-0 ${
                    englishDefault ? "uppercase" : ""
                  }`}
                >
                  {front}
                </span>
                <span
                  className={`absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 ${
                    englishDefault ? "" : "uppercase"
                  }`}
                >
                  {back}
                </span>
              </button>
            );
          })}
        </div>
      ))}
      <div className="mt-0.5 flex justify-center gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={onBackspace}
          className="h-12 rounded-xl border border-border bg-surface-muted px-6 text-sm font-bold text-foreground transition-colors hover:border-primary disabled:opacity-40"
        >
          Delete
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onEnter}
          className="h-12 rounded-xl bg-primary px-8 text-sm font-bold text-on-primary transition-colors hover:bg-primary-hover disabled:opacity-40"
        >
          Enter
        </button>
      </div>
    </div>
  );
}
