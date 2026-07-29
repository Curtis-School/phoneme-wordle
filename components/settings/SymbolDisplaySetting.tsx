"use client";

import { useState, useTransition } from "react";
import type { SymbolDisplay } from "@/lib/types";
import { persistSymbolDisplay } from "@/lib/settings-actions";

type SymbolDisplaySettingProps = {
  initialDisplay: SymbolDisplay;
};

const OPTIONS: { value: SymbolDisplay; label: string }[] = [
  { value: "ipa", label: "IPA symbol" },
  { value: "english", label: "English letter" },
];

export function SymbolDisplaySetting({
  initialDisplay,
}: SymbolDisplaySettingProps) {
  const [display, setDisplay] = useState<SymbolDisplay>(initialDisplay);
  const [isPending, startTransition] = useTransition();

  function select(next: SymbolDisplay) {
    if (next === display) return;
    setDisplay(next);
    startTransition(() => {
      persistSymbolDisplay(next);
    });
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-foreground">
          Default tile display
        </h2>
        <p className="text-sm text-muted">
          Choose which symbol tiles show at rest. The other symbol still appears
          on hover.
        </p>
      </div>

      <div
        role="radiogroup"
        aria-label="Default tile display"
        className="inline-flex w-full max-w-xs gap-1 rounded-xl border border-border bg-surface-muted p-1"
      >
        {OPTIONS.map(({ value, label }) => {
          const active = display === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={isPending}
              onClick={() => select(value)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary text-on-primary"
                  : "text-foreground hover:bg-surface"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
