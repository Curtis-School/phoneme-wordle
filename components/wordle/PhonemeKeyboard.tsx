"use client";

import type { Phoneme, SymbolDisplay } from "@/lib/types";
import { phonemeHint } from "@/lib/phoneme";
import { FlipFace } from "@/components/phoneme/PhonemeTile";

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
  return (
    <div className="flex w-full flex-col items-center gap-2">
      <div className="grid w-full max-w-sm grid-cols-4 gap-2 self-stretch sm:w-auto sm:max-w-none sm:grid-cols-6 sm:self-center">
        {keys.map((phoneme) => (
          <button
            key={phoneme.ipa}
            type="button"
            disabled={disabled}
            onClick={() => onPress(phoneme.ipa)}
            title={showTooltip ? phonemeHint(phoneme) : undefined}
            className="group relative inline-flex h-12 w-full min-w-13 items-center justify-center rounded-xl border border-border bg-surface px-1 text-sm font-semibold text-foreground transition-colors hover:border-primary disabled:opacity-40"
          >
            <FlipFace ipa={phoneme.ipa} english={phoneme.english} display={display} />
          </button>
        ))}
      </div>
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
