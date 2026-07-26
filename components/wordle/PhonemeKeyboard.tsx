"use client";

import type { Phoneme } from "@/lib/types";

type PhonemeKeyboardProps = {
  keys: readonly Phoneme[];
  onPress: (ipa: string) => void;
  onEnter: () => void;
  onBackspace: () => void;
  disabled?: boolean;
};

export function PhonemeKeyboard({
  keys,
  onPress,
  onEnter,
  onBackspace,
  disabled = false,
}: PhonemeKeyboardProps) {
  const half = Math.ceil(keys.length / 2);
  const rows = [keys.slice(0, half), keys.slice(half)];

  return (
    <div className="flex items-start gap-1.5">
      <div className="flex flex-col gap-1.5">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1.5">
            {row.map((phoneme) => (
              <button
                key={phoneme.ipa}
                type="button"
                disabled={disabled}
                onClick={() => onPress(phoneme.ipa)}
                title={`${phoneme.label} (${phoneme.example})`}
                className="group relative inline-flex h-12 min-w-11 items-center justify-center rounded-lg border border-border bg-surface px-3 text-sm font-semibold text-foreground transition-colors hover:border-primary disabled:opacity-40"
              >
                <span className="transition-opacity group-hover:opacity-0">
                  {phoneme.ipa}
                </span>
                <span className="absolute inset-0 flex items-center justify-center uppercase opacity-0 transition-opacity group-hover:opacity-100">
                  {phoneme.english}
                </span>
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1.5">
        <button
          type="button"
          disabled={disabled}
          onClick={onBackspace}
          className="h-12 min-w-16 rounded-lg border border-border bg-surface-muted px-3 text-sm font-semibold text-foreground transition-colors hover:border-primary disabled:opacity-40"
        >
          Del
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onEnter}
          className="h-12 min-w-16 rounded-lg border border-border bg-surface-muted px-3 text-sm font-semibold text-foreground transition-colors hover:border-primary disabled:opacity-40"
        >
          Enter
        </button>
      </div>
    </div>
  );
}
